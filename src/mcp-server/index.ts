/**
 * @fileoverview MCP Server 入口
 * 支持三种 transport 模式，通过 CJ_TRANSPORT 环境变量切换：
 * - stdio（默认）: 供 Claude Desktop / Cursor / VS Code 本地调用
 * - http: 供 ChatGPT Web 等通过 MCP 服务器 URL 调用（配合 ngrok 等内网穿透工具）
 * - https: 本地 HTTPS 模式，适合需要直接 HTTPS 访问的场景（需本地证书）
 *
 * @note HTTP 模式启动：CJ_TRANSPORT=http CJ_HTTP_PORT=3009 node dist/mcp-server/index.cjs
 *   然后用 ngrok http 3009 暴露公网地址，填入 ChatGPT 的"MCP 服务器 URL"
 * @note HTTPS 模式启动：先生成证书 npm run gen:cert，再 npm run start:https
 *   证书路径由 CJ_HTTPS_CERT（默认 certs/cert.pem）和 CJ_HTTPS_KEY（默认 certs/key.pem）指定
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createHttpsServer } from 'node:https';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { registerTools, handleToolCall, getToolsList } from './tools/index.js';
import { logger } from '../utils/logger.js';
import { registerResources, handleResourceRead, getResourcesList } from './resources/index.js';
import { directTokenStorage } from '../auth/api-key-context.js';
import { classifyMcpPath } from './url-parser.js';
import { clientRequestStorage, extractClientRequestContext } from '../utils/client-request-context.js';
import { MCP_CORS_ALLOWED_HEADERS, MCP_TRANSPORT_OPTIONS } from './transport-config.js';

// 工具/资源注册（模块级，只执行一次）
registerTools();
registerResources();

/**
 * 创建并配置 MCP Server 实例（每次连接独立实例，共享模块级 session 状态）
 */
function createMCPServer(): Server {
  const mcpServer = new Server(
    { name: 'cj-dropshipping-mcp', version: '0.2.0' },
    {
      capabilities: {
        tools: {},
        resources: {},
        extensions: {
          'io.modelcontextprotocol/ui': {
            mimeTypes: ['text/html;profile=mcp-app'],
          },
        },
      },
    }
  );

  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: getToolsList(),
  }));

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    return handleToolCall(name, args || {});
  });

  mcpServer.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: getResourcesList(),
  }));

  mcpServer.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    logger.debug(`[RESOURCE] Reading URI: ${request.params.uri}`);
    return await handleResourceRead(request.params.uri);
  });

  return mcpServer;
}

async function main() {
  const transportType = process.env.CJ_TRANSPORT || 'stdio';

  if (transportType === 'http' || transportType === 'https') {
    /**
     * HTTP/HTTPS StreamableHTTP 模式
     * @note HTTP 模式配合 ngrok 步骤：
     *   1. npm run start:http （启动本地 HTTP MCP Server）
     *   2. ngrok http 3009 （获取公网 HTTPS URL）
     *   3. 在 ChatGPT 设置 → 应用 → 开发者模式 → 创建应用 → 填入 https://xxxx.ngrok-free.app/mcp
     * @note HTTPS 模式（本地直接 HTTPS）:
     *   1. npm run gen:cert （生成自签名证书到 certs/ 目录，仅首次需要）
     *   2. npm run start:https （启动本地 HTTPS MCP Server，无需 ngrok）
     *   3. 填入 https://localhost:3009/mcp（浏览器需信任自签名证书）
     * @note MCP Apps 登录弹窗（_meta.ui.resourceUri）在 ChatGPT 中不可用（VS Code 专属）。
     *   ChatGPT 中需通过 verify_credentials 传入 loginName+password 完成认证，
     *   或使用直连 Token URL（/mcp/API@userId@CJ:token）。apiKey 登录已下线。
     */
    const port = parseInt(process.env.CJ_HTTP_PORT || '3009', 10);

    const requestHandler = async (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => {
      // CORS 支持（允许 ChatGPT Web 跨域请求）
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', MCP_CORS_ALLOWED_HEADERS);

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', tools: getToolsList().length }));
        return;
      }

      /**
       * @note 下线 apiKey 登录: 只处理 /mcp（本地/密码登录会话）与
       *   /mcp/API@{userId}@CJ:{accessToken}（直连 Token，stateless）。
       *   原 /mcp/{apiKey} 自动认证已移除，裸 apiKey 路径由 classifyMcpPath 归入 reject → HTTP 400。
       *
       * @note GET /mcp 不解析 body（GET 无 body）；POST 才读取并解析 body。
       * @note 直接 Token URL: /mcp/API@{userId}@CJ:{accessToken} 或 /mcp/MCP@...；
       *   accessToken 含特殊字符（+、/、= 等）须 URL 编码；过期需用户更新 URL（服务端无存储）。
       */
      const urlPath = (req.url ?? '/').split('?')[0];
      const route = classifyMcpPath(urlPath);

      // 已下线的 apiKey URL（/mcp/{非直连 Token}）→ 显式 400
      if (route?.kind === 'reject') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: route.reason }));
        return;
      }

      if (route) {
        const urlDirectToken = route.kind === 'directToken' ? route.token : undefined;

        /**
         * @note 新增(第1次提交 / 26年07月19日): 透传客户端原始请求信息，修复原始 IP 丢失。
         *   从入站 req.headers 提取客户端原始请求上下文（IP/host/url/UA/xff），用
         *   clientRequestStorage 包裹后续处理；出站后端请求（http-client / 各 raw fetch）
         *   即可从上下文读取并透传 client-request-* 与 x-forwarded-for header。
         *   与既有 directTokenStorage 嵌套共存（AsyncLocalStorage 互不干扰）。
         */
        const clientReqCtx = extractClientRequestContext(req.headers);
        const runWithContext = (fn: () => Promise<void> | void): Promise<void> | void => {
          const runInner = urlDirectToken
            ? () => directTokenStorage.run(urlDirectToken, fn)
            : fn;
          return clientRequestStorage.run(clientReqCtx, runInner);
        };

        const mcpServer = createMCPServer();
        /**
         * stateless 模式：sessionIdGenerator=undefined，不下发 mcp-session-id，每个请求独立
         * （新建 Server+Transport，处理完即 close，见下方 res.on('finish')）。
         *
         * @note 架构权衡(线上服务重启): 有意保持无状态，不改成有状态。
         *   代价：客户端(ChatGPT)无法复用已 initialize 的会话，每个「发现回合」
         *     (tools/list、resources/list、resources/read) 会重新握手，单次连接约多几秒开销
         *     （其中「双 initialize」是 ChatGPT 客户端行为，服务端无法消除）。
         *   收益：可在阿里云 ACK 直接多 Pod 水平扩展，无需 SLB 会话保持(sticky)，
         *     Pod 重启/漂移不丢会话——这是当前部署方式的核心诉求。
         *   若改有状态：SSE 长连接+后续 POST 必须命中同一 Pod（Redis 存不了活的 transport），
         *     必须开 sticky 且重启丢会话，与多 Pod 目标冲突，故不采用。
         */
        const transport = new StreamableHTTPServerTransport(MCP_TRANSPORT_OPTIONS);
        await mcpServer.connect(transport);

        /**
         * GET 请求是 SSE 事件流建立，无 body，直接处理。
         * POST 请求是 JSON-RPC 调用，需要读取并解析 body。
         */
        if (req.method !== 'POST') {
          const authTag = urlDirectToken ? `directToken(${urlDirectToken.userId})` : 'none';
          if (req.method === 'GET') {
            logger.raw(`[MCP-REQ] ${new Date().toISOString()} | GET(SSE) | auth=${authTag}`);
          }

          const handleRequest = () => transport.handleRequest(req, res, undefined);
          await runWithContext(handleRequest);
        } else {
          // 读取请求 body
          const chunks: Buffer[] = [];
          for await (const chunk of req as AsyncIterable<Buffer>) {
            chunks.push(chunk);
          }

          let body: unknown;
          try {
            body = JSON.parse(Buffer.concat(chunks).toString());
          } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON body' }));
            await transport.close();
            await mcpServer.close();
            return;
          }

          // @note 外部客户端（ChatGPT）请求实时日志，弥补 Inspector 无法显示外部 Session 的不足
          {
            const b = body as Record<string, unknown>;
            let rpcLabel = String(b?.method ?? '?');
            let argsSummary = '';
            if (b?.method === 'tools/call') {
              const params = b.params as Record<string, unknown>;
              const name = params?.name;
              rpcLabel = `tools/call:${name}`;
              const args = params?.arguments as Record<string, unknown> | undefined;
              if (args && Object.keys(args).length > 0) {
                // 只显示参数键名（不显示值，避免泄露密码等敏感信息）
                argsSummary = ` | args=[${Object.keys(args).join(',')}]`;
              }
            }
            const authTag = urlDirectToken ? ` | directToken(${urlDirectToken.userId})` : '';
            const id  = (b as Record<string, unknown>)?.id != null ? `#${(b as Record<string, unknown>).id}` : '';
            logger.raw(`[MCP-REQ] ${new Date().toISOString()} | ${rpcLabel}${id}${authTag}${argsSummary}`);
          }

          const handlePost = () => transport.handleRequest(req, res, body);
          await runWithContext(handlePost);
        }

        res.on('finish', async () => {
          await transport.close();
          await mcpServer.close();
        });
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    };

    if (transportType === 'https') {
      /**
       * @note 新增(42次): HTTPS 本地模式
       * 读取证书路径：CJ_HTTPS_CERT（默认 certs/cert.pem）和 CJ_HTTPS_KEY（默认 certs/key.pem）
       * 生成自签名证书：npm run gen:cert
       */
      const certPath = resolve(process.env.CJ_HTTPS_CERT || 'certs/cert.pem');
      const keyPath = resolve(process.env.CJ_HTTPS_KEY || 'certs/key.pem');

      if (!existsSync(certPath) || !existsSync(keyPath)) {
        console.error(`[MCP] ❌ 找不到 HTTPS 证书文件。请先运行: npm run gen:cert`);
        console.error(`[MCP]    证书路径: ${certPath}`);
        console.error(`[MCP]    私钥路径: ${keyPath}`);
        console.error(`[MCP]    或通过 CJ_HTTPS_CERT / CJ_HTTPS_KEY 环境变量指定自定义路径`);
        process.exit(1);
      }

      const httpsServer = createHttpsServer(
        {
          cert: readFileSync(certPath),
          key: readFileSync(keyPath),
        },
        requestHandler
      );

      httpsServer.listen(port, () => {
        console.error(`[MCP] HTTPS Server running on https://localhost:${port}/mcp`);
        console.error(`[MCP] Health check: https://localhost:${port}/health`);
        console.error(`[MCP] Tools: ${getToolsList().length}`);
        console.error(`[MCP] 💡 自签名证书需在浏览器/客户端中手动信任`);
      });
    } else {
      const httpServer = createHttpServer(requestHandler);

      httpServer.listen(port, () => {
        console.error(`[MCP] HTTP Server running on http://localhost:${port}/mcp`);
        console.error(`[MCP] Health check: http://localhost:${port}/health`);
        console.error(`[MCP] Tools: ${getToolsList().length}`);
      });
    }
  } else {
    // stdio 模式（默认，VS Code / Claude Desktop）
    const mcpServer = createMCPServer();
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
  }
}

main().catch((error) => {
  console.error('MCP Server failed to start:', error);
  process.exit(1);
});

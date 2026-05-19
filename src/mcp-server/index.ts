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
import { apiKeyStorage, directTokenStorage } from '../auth/api-key-context.js';
import { getSession, refreshSession, createSession } from '../auth/session.js';

// 工具/资源注册（模块级，只执行一次）
registerTools();
registerResources();

/**
 * 确保 apiKey 对应的 session 有效，自动创建或刷新。
 * 在 apiKeyStorage.run(apiKey) 上下文中执行，session 操作全部路由到 apiKeySessions Map。
 *
 * @note 新增(apiKey-URL 方案): 每次 /mcp/{apiKey} 请求前调用，保证 accessToken 可用。
 *   若 accessToken 有效 → 直接返回；若 refreshToken 可用 → 静默刷新；否则使用 apiKey 重新认证。
 *   认证失败时不中断请求，tools 调用会自然返回「未登录」错误。
 */
async function ensureApiKeySession(apiKey: string): Promise<void> {
  await apiKeyStorage.run(apiKey, async () => {
    const session = getSession();
    if (session && new Date(session.accessTokenExpiry) > new Date()) return; // accessToken 有效

    if (session?.refreshToken && new Date(session.refreshTokenExpiry) > new Date()) {
      const refreshed = await refreshSession();
      if (refreshed) return; // 刷新成功
    }

    // 使用 apiKey 重新认证
    try {
      await createSession('apikey-url-user', apiKey);
    } catch (e) {
      logger.warn('AUTH', `[ensureApiKeySession] apiKey URL 自动认证失败: ${e}`);
    }
  });
}

/**
 * 创建并配置 MCP Server 实例（每次连接独立实例，共享模块级 session 状态）
 */
function createMCPServer(): Server {
  const mcpServer = new Server(
    { name: 'cj-dropshipping-mcp', version: '0.2.0' },
    { capabilities: { tools: {}, resources: {} } }
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
    return handleResourceRead(request.params.uri);
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
     *   ChatGPT 中需通过 verify_credentials 传入 loginName+password 或 apiKey 完成认证。
     */
    const port = parseInt(process.env.CJ_HTTP_PORT || '3009', 10);

    const requestHandler = async (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => {
      // CORS 支持（允许 ChatGPT Web 跨域请求）
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');

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
       * @note 新增(apiKey-URL 方案): 同时处理 /mcp、/mcp/{apiKey} 和 /mcp/API@userId@CJ:token 三种路径。
       *   - /mcp：原有行为，本地 session（currentSession / 文件）
       *   - /mcp/{apiKey}：从 URL 提取 apiKey，先调用 ensureApiKeySession 自动认证，
       *     再将请求包装在 apiKeyStorage.run(apiKey) 上下文中执行，session 路由到 apiKeySessions Map。
       *   - /mcp/API@{userId}@CJ:{accessToken}：从 URL 提取直接 accessToken，无需调用认证 API，
       *     零服务端内存存储（stateless），将请求包装在 directTokenStorage.run({userId,accessToken}) 中。
       *
       * @note 修复(apiKey-URL 方案): GET /mcp 不再尝试解析 body（GET 无 body，会导致 JSON.parse 400）。
       *   GET 请求（SSE 事件流）直接传 undefined 给 transport.handleRequest。
       *   POST 请求才读取并解析 body。
       *
       * @note 直接 Token URL 格式说明: /mcp/API@{userId}@CJ:{accessToken}
       *   accessToken 若含 URL 特殊字符（+、/、= 等）须做 URL 编码后填入 ChatGPT 应用 URL。
       *   Token 过期后需用户更新 ChatGPT 应用的 URL（服务端无存储，无法自动续期）。
       */
      const urlPath = (req.url ?? '/').split('?')[0];

      // 优先检测直接 Token 格式：/mcp/API@{userId}@CJ:{accessToken}
      const directTokenMatch = urlPath.match(/^\/mcp\/(API@([^@]+)@CJ:(.+))$/);
      // 其次检测 apiKey 格式：/mcp/{anything}（排除直接 Token 格式）
      const mcpApiKeyMatch = !directTokenMatch && urlPath.match(/^\/mcp\/(.+)$/);

      const urlApiKey = mcpApiKeyMatch ? decodeURIComponent(mcpApiKeyMatch[1]) : undefined;
      const urlDirectToken = directTokenMatch
        ? { userId: directTokenMatch[2], accessToken: decodeURIComponent(directTokenMatch[3]) }
        : undefined;

      const isMcpPath = urlPath === '/mcp' || !!mcpApiKeyMatch || !!directTokenMatch;

      if (isMcpPath) {
        // apiKey 模式：先确保 session 有效（自动认证/续期），直接 Token 模式无需此步骤
        if (urlApiKey) {
          await ensureApiKeySession(urlApiKey);
        }

        const mcpServer = createMCPServer();
        // stateless 模式：无 sessionId，每次请求独立
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
        await mcpServer.connect(transport);

        /**
         * GET 请求是 SSE 事件流建立，无 body，直接处理。
         * POST 请求是 JSON-RPC 调用，需要读取并解析 body。
         */
        if (req.method === 'GET') {
          const authTag = urlDirectToken
            ? `directToken(${urlDirectToken.userId})`
            : urlApiKey ? `apiKey(${urlApiKey.slice(0, 12)}…)` : 'none';
          logger.raw(`[MCP-REQ] ${new Date().toISOString()} | GET(SSE) | auth=${authTag}`);

          const handleGet = () => transport.handleRequest(req, res, undefined);
          if (urlDirectToken) {
            await directTokenStorage.run(urlDirectToken, handleGet);
          } else if (urlApiKey) {
            await apiKeyStorage.run(urlApiKey, handleGet);
          } else {
            await handleGet();
          }
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

          // @note 新增(60次): 外部客户端（ChatGPT）请求实时日志，弥补 Inspector 无法显示外部 Session 的不足
          // @note 更新(62次): 加入参数摘要（tools/call 时显示参数 key 列表），同时通过 logger.raw 写入日志文件
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
            const authTag = urlDirectToken
              ? ` | directToken(${urlDirectToken.userId})`
              : urlApiKey ? ` | apiKey=${urlApiKey.slice(0, 12)}…` : '';
            const id  = (b as Record<string, unknown>)?.id != null ? `#${(b as Record<string, unknown>).id}` : '';
            logger.raw(`[MCP-REQ] ${new Date().toISOString()} | ${rpcLabel}${id}${authTag}${argsSummary}`);
          }

          const handlePost = () => transport.handleRequest(req, res, body);
          if (urlDirectToken) {
            await directTokenStorage.run(urlDirectToken, handlePost);
          } else if (urlApiKey) {
            await apiKeyStorage.run(urlApiKey, handlePost);
          } else {
            await handlePost();
          }
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
        console.error(`[MCP] Use ngrok: ngrok http ${port}`);
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

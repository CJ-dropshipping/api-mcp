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

// 工具/资源注册（模块级，只执行一次）
registerTools();
registerResources();

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

      if (req.url === '/mcp') {
        const mcpServer = createMCPServer();
        // stateless 模式：无 sessionId，每次请求独立
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
        await mcpServer.connect(transport);

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
          const sid = String(req.headers['mcp-session-id'] ?? 'new').slice(0, 8);
          const id  = b?.id != null ? `#${b.id}` : '';
          logger.raw(`[MCP-REQ] ${new Date().toISOString()} | ${rpcLabel}${id} | sid=${sid}${argsSummary}`);
        }

        await transport.handleRequest(req, res, body);

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

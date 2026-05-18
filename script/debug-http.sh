#!/usr/bin/env bash
# script/debug-http.sh
# 一键启动 HTTP MCP 服务器（终端实时打印 [MCP-REQ] 日志）
# 用法：npm run debug:http

set -e

PORT=${CJ_HTTP_PORT:-3009}
ENV=${CJ_ENV:-test}

echo "🚀 启动 HTTP MCP 服务器 (port: $PORT, env: $ENV)..."
echo "📌 MCP 服务地址: http://localhost:$PORT/mcp"
echo "📋 外部客户端请求将实时打印 [MCP-REQ] 日志"
echo ""

CJ_TRANSPORT=http CJ_ENV=$ENV CJ_HTTP_PORT=$PORT node dist/mcp-server/index.cjs

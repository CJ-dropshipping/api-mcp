#!/usr/bin/env bash
# Cursor / Claude Desktop 等 IDE 启动 MCP Server 的 stdio 入口
# 自动切换到 Node 20+（项目要求 >=20，系统默认可能是 v16）

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [ -s "${HOME}/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "${HOME}/.nvm/nvm.sh"
  nvm use 20 >/dev/null 2>&1 || nvm use node >/dev/null 2>&1 || true
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
if [ "${NODE_MAJOR}" -lt 20 ]; then
  echo "CJ MCP Server 需要 Node.js >= 20，当前版本: $(node -v 2>/dev/null || echo unknown)" >&2
  exit 1
fi

exec node "${PROJECT_DIR}/dist/mcp-server/index.cjs"

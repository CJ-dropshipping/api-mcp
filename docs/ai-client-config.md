# AI 客户端连接配置

## Claude Desktop

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）：

```json
{
  "mcpServers": {
    "cj-dropshipping": {
      "command": "npx",
      "args": ["tsx", "/Users/zhaojuchang/Documents/myProject/ai/CJMCPAPP/src/mcp-server/index.ts"],
      "env": {
        "CJ_API_BASE": "https://www.cjdropshipping.com",
        "CJ_PLATFORM": "1",
        "CJ_LANGUAGE": "en",
        "CJ_CURRENCY": "USD"
      }
    }
  }
}
```

## Cursor

编辑 `.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "cj-dropshipping": {
      "command": "npx",
      "args": ["tsx", "/Users/zhaojuchang/Documents/myProject/ai/CJMCPAPP/src/mcp-server/index.ts"],
      "env": {
        "CJ_API_BASE": "https://www.cjdropshipping.com"
      }
    }
  }
}
```

## VS Code (Copilot)

编辑 `.vscode/mcp.json`：

```json
{
  "servers": {
    "cj-dropshipping": {
      "command": "npx",
      "args": ["tsx", "/Users/zhaojuchang/Documents/myProject/ai/CJMCPAPP/src/mcp-server/index.ts"],
      "env": {
        "CJ_API_BASE": "https://www.cjdropshipping.com"
      }
    }
  }
}
```

## Codex

编辑 `codex.json` 或在 Codex 设置中添加 MCP Server：

```json
{
  "mcpServers": {
    "cj-dropshipping": {
      "command": "npx",
      "args": ["tsx", "/Users/zhaojuchang/Documents/myProject/ai/CJMCPAPP/src/mcp-server/index.ts"],
      "env": {
        "CJ_API_BASE": "https://www.cjdropshipping.com"
      }
    }
  }
}
```

## MCP Inspector 调试

```bash
cd /Users/zhaojuchang/Documents/myProject/ai/CJMCPAPP
npx @modelcontextprotocol/inspector npx tsx src/mcp-server/index.ts
```

## ChatGPT 远程 MCP 连接（线上发布）

> 详细部署步骤参见：`docs/部署指南-线上发布供ChatGPT使用.md`

### 快速方式：ngrok 内网穿透

```bash
# 步骤 1: 构建并启动生产 MCP HTTP Server
npm run build
npm run start:production
# 或一键启动（同时启动 server 和 ngrok）:
npm run start:ngrok
```

```bash
# 步骤 2: 在另一个终端启动 ngrok（若未用 start:ngrok 一键脚本）
ngrok http 3009
# 输出：Forwarding https://abc123.ngrok-free.app -> http://localhost:3009
```

**步骤 3**：在 ChatGPT 中配置：
1. [chatgpt.com](https://chatgpt.com) → 探索 GPTs → 创建 GPT → 配置 → 操作 → **添加操作**
2. 选择 **MCP 服务器** 类型
3. 填入 URL：`https://abc123.ngrok-free.app/mcp`（替换为实际 ngrok 地址）
4. 测试工具：提问 `帮我搜索 iphone case 商品`

### 生产方式：VPS + Docker + nginx

1. 构建镜像：`docker build -t cj-mcp-server .`
2. 运行容器：`docker run -d --name cj-mcp -p 3009:3009 -e CJ_TRANSPORT=http -e CJ_ENV=production cj-mcp-server`
3. nginx 反向代理（见部署指南）
4. ChatGPT 填入：`https://mcp.yourdomain.com/mcp`

### 验证服务健康状态

```bash
# 本地验证
curl http://localhost:3009/health
# 返回：{"status":"ok","tools":17}

# 公网验证（ngrok）
curl https://abc123.ngrok-free.app/health
```

## 使用说明

1. 首次使用需通过 `set_token` 工具设置登录 Token
2. 从浏览器 Cookie 中获取 `cjLoginToken` 的值
3. 调用 `get_login_status` 验证 Token 是否有效
4. Token 会加密存储在本地，下次启动自动恢复

---

## System Prompt 配置（提升低能力模型的工具调用准确率）

> 适用于 Claude Desktop / ChatGPT / Cursor / Codex 等 AI 客户端，在自定义 System Prompt 或 User Instructions 中加入以下内容。

```markdown
## CJ Dropshipping MCP 助手规则

你是一个 CJdropshipping 跨境电商助手，通过 MCP 工具帮助用户操作商城。

### 登录规则
- 调用任何业务工具前，先检查登录状态：调用 `check_login_status`
- 未登录时调用 `wait_for_login(timeout=120)` 等待用户在弹窗完成登录
- Codex/CLI 环境中直接调用 `verify_credentials(loginName, password)` 文字登录

### 商品查询意图映射
- 「找XX商品」「搜XX」「有没有XX」→ `search_products(keyword="XX")`
- 「价格在XX以内的」→ 同时传 `maxPrice=XX`
- 「看下一页」「更多」→ `pageNum` +1

### 订单查询意图映射
- 「最近一笔订单」「最新订单」「最后一单」→ `get_order_list(sortByLatest=true)`
- 「订单DXXXX」「查一下订单号XXXX」→ `get_order_list(orderIds=["XXXX"])`
- 「已发货的订单」→ `get_order_list(status="shipped")`
- 「历史订单」「买了什么」→ `get_order_list(pageNum=1)`
- 「待支付的订单」→ `get_pay_order_list()`

### 纠纷查询意图映射
- 「我有哪些纠纷」→ `list_disputes()`
- 「处理中的纠纷」→ `list_disputes(status="processing")`
- 「已解决的纠纷」→ `list_disputes(status="finished")`

### 重要规则
- 敏感操作（下单/发起纠纷/合单）需向用户确认后再执行
- 工具返回 `isError=true` 时，告知用户错误原因，不要反复重试
- `show_login_form` 不会弹出窗口，仅返回文字引导；需弹窗请用 `wait_for_login`
- Codex 环境中 `wait_for_login` 不会弹窗，改用 `verify_credentials` 直接登录
```

### 快速使用方式

| AI 客户端 | 配置位置 | 说明 |
|-----------|---------|------|
| Claude Desktop | Settings → Custom Instructions | 粘贴 System Prompt |
| ChatGPT Web | Settings → Customize ChatGPT → Custom instructions | 粘贴到「How would you like ChatGPT to respond?」 |
| Cursor | `.cursor/rules` 文件 | 在项目根目录创建 `.cursor/rules` 写入 System Prompt |
| VS Code Copilot | `.github/copilot-instructions.md` | 在工作区创建此文件 |


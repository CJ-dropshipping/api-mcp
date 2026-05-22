# CJ Dropshipping MCP Server

CJ Dropshipping 的 MCP（Model Context Protocol）服务器，让 AI 助手能够直接调用 CJ 的 API 能力。支持在 VS Code GitHub Copilot、ChatGPT 等 AI 平台中，通过自然语言完成商品搜索、订单管理、物流查询等操作。

## 功能特性

- 🛒 **商品操作** — 搜索商品、查看详情、查询库存和变体
- 📦 **订单管理** — 创建订单、查询订单列表/详情、确认/删除订单
- 🚚 **物流服务** — 运费计算、物流时效查询、物流跟踪
- 🏪 **店铺管理** — 店铺列表、商品连接/断开、商品刊登
- 💰 **支付功能** — 余额查询、订单支付、支付链接生成
- 🛡️ **纠纷处理** — 发起/查询/确认/取消纠纷
- 🔐 **登录鉴权** — UI 登录、凭据验证、会话管理

## 技术栈

- **运行时:** Node.js >= 20.0.0
- **协议:** MCP SDK (`@modelcontextprotocol/sdk`)
- **传输方式:** stdio（本地）/ StreamableHTTP（远程）
- **构建:** esbuild
- **测试:** vitest

## 快速开始

### 方式一：VS Code（GitHub Copilot）— 推荐

**第一步：获取源码并构建**

```bash
git clone https://github.com/CJ-dropshipping/api-mcp.git
cd api-mcp
npm install
npm run build
```

构建完成后记录项目的**绝对路径**（后续配置需要用到）：

```bash
# macOS / Linux
pwd
# Windows（PowerShell）
(Get-Location).Path
```

**第二步：配置 VS Code MCP**

在任意工作区根目录创建 `.vscode/mcp.json`，将 `<绝对路径>` 替换为上一步获取的路径：

```json
{
  "servers": {
    "cj-dropshipping": {
      "type": "stdio",
      "command": "node",
      "args": ["<绝对路径>/dist/mcp-server/index.cjs"]
    }
  }
}
```

macOS 示例：
```json
{
  "servers": {
    "cj-dropshipping": {
      "type": "stdio",
      "command": "node",
      "args": ["/Users/yourname/api-mcp/dist/mcp-server/index.cjs"]
    }
  }
}
```

> **提示**：也可以配置可选环境变量来定制行为，例如开启日志文件：
> ```json
> "env": { "CJ_LOG_LEVEL": "info", "CJ_LOG_FILE": "true" }
> ```

**第三步：首次登录**

1. 在 VS Code 中打开 GitHub Copilot Chat，切换到 **Agent 模式**
2. 向 Copilot 发送指令：`请帮我登录 CJ`（或直接使用 `show_login_form` 工具）
3. Copilot 会弹出 CJ 登录页面，在页面中输入 CJ 账号密码完成登录
4. 登录成功后，Session 会自动持久化到本地 `.cj-token` 文件，无需每次重新登录

登录完成后即可通过自然语言使用全部 CJ 工具（商品搜索、订单管理、物流查询等）。

### 方式二：ChatGPT（远程 HTTP 模式）

1. 获取 CJ API Key → 获取 Access Token
2. 在 ChatGPT 设置中创建 MCP 应用，填入 URL：`https://developers.cjdropshipping.cn/mcp/YOUR_ACCESS_TOKEN`

详见 [完整接入文档](https://developers.cjdropshipping.com/zh/api/api2/mcp.html)。

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `CJ_ENV` | `production` | 环境：`production`（生产，默认）、`test`（CJ 内网测试，仅 CJ 员工可用） |
| `CJ_TRANSPORT` | `stdio` | 传输方式：`stdio`、`http`、`https` |
| `CJ_HTTP_PORT` | `3009` | HTTP 模式监听端口 |
| `CJ_LOG_LEVEL` | `info` | 日志级别：`debug`、`info`、`warn`、`error` |
| `CJ_LOG_FILE` | `false` | 输出日志到文件 |
| `CJ_LANGUAGE` | `en` | 默认语言 |
| `CJ_CURRENCY` | `USD` | 默认货币 |

## 本地开发

```bash
# 安装依赖
npm install

# 开发模式（stdio）
npm run dev

# 构建
npm run build

# HTTP 模式运行（测试环境）
npm run start:http

# HTTP 模式运行（生产环境）
npm run start:production

# 运行测试
npm test
```

## 项目结构

```
src/
├── mcp-server/          # MCP 服务器入口
│   └── index.ts         # 主入口，注册工具和传输层
├── tools/               # MCP 工具实现
├── services/            # API 服务层
├── auth/                # 登录鉴权模块
└── utils/               # 通用工具函数
tests/                   # 测试文件
docs/                    # 文档
logs/                    # 运行日志（CJ_LOG_FILE=true 时生成）
```

## 调试

### 查看日志

设置 `CJ_LOG_FILE=true` 后，日志文件输出到 `logs/mcp-YYYY-MM-DD.log`。

在 VS Code 中，可通过 **Output 面板** 查看对应 MCP Server 的 stderr 输出。

### HTTP 调试

```bash
# 使用调试脚本
npm run debug:http

# 带日志的调试
npm run debug:http:log
```

### 清除本地 Token

```bash
npm run clear-token
```

## 相关文档

- [MCP 接入指南（中文）](https://developers.cjdropshipping.com/zh/api/api2/mcp.html)
- [MCP Integration Guide (English)](https://developers.cjdropshipping.com/en/api/api2/mcp.html)
- [CJ API 文档](https://developers.cjdropshipping.com/)
- [MCP 协议规范](https://modelcontextprotocol.io/)


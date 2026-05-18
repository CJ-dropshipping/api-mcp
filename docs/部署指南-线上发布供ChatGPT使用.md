# CJMCPAPP 线上发布指南（供 ChatGPT 远程 MCP 使用）

> 创建时间：26年05月18日 14:09:07
> 关联需求：业务逻辑功能-提示词.md 第4次补充需求

---

## 一、背景与目标

本项目 MCP Server 已支持 HTTP transport（`CJ_TRANSPORT=http`），可以通过公网 HTTPS URL 被 ChatGPT 等远程 AI 客户端调用。

**ChatGPT 远程 MCP 原理：**
```
ChatGPT → HTTPS MCP Server URL → /mcp (StreamableHTTP) → CJ OpenAPI
```

---

## 二、方案对比

| 方案 | 适用场景 | 维护成本 | 是否需要服务器 |
|------|---------|---------|-------------|
| 方案A：ngrok（本机穿透）| 个人快速测试 | 低 | ❌ 不需要（本机运行）|
| 方案B：Docker + VPS | 稳定生产环境 | 中 | ✅ 需要（阿里云/腾讯云等）|
| 方案C：Railway/Render PaaS | 中型生产/快速上线 | 低 | ❌ 不需要（托管平台）|

---

## 三、方案A：ngrok 快速测试（推荐优先验证）

> ngrok 已配置 auth token，可直接使用。

### 步骤 1：启动本地 MCP HTTP Server

```bash
cd /path/to/CJMCPAPP
. ~/.nvm/nvm.sh && nvm use 20
# 生产环境需要设置 CJ_ENV=production
npm run start:http
# 或（带日志）：
CJ_TRANSPORT=http CJ_ENV=production CJ_HTTP_PORT=3009 node dist/mcp-server/index.cjs
```

### 步骤 2：启动 ngrok 暴露公网地址

```bash
# 新开一个终端
ngrok http 3009
```

输出示例：
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3009
```

### 步骤 3：在 ChatGPT 中配置远程 MCP

1. 打开 [ChatGPT](https://chatgpt.com) → 左侧菜单 → **探索 GPTs** 或进入**我的 GPT**
2. 点击 **创建 GPT** → **配置** → **操作** → **添加操作**
3. 选择 **MCP 服务器** 类型
4. 填入 URL：`https://abc123.ngrok-free.app/mcp`
5. 保存并测试

> ⚠️ 注意：ngrok 免费版每次重启地址会变，需要重新在 ChatGPT 中更新 URL。可购买 ngrok 付费版绑定固定域名。

---

## 四、方案B：Docker + VPS 生产部署

### 4.1 前置条件

- 一台公网 VPS（阿里云/腾讯云/AWS，最低 1C1G）
- 一个域名并解析到 VPS IP（如 `mcp.yourdomain.com`）
- VPS 已安装 Docker + nginx
- SSL 证书（Let's Encrypt 免费）

### 4.2 构建 Docker 镜像

项目根目录已有 `Dockerfile`，执行：

```bash
# 本地构建（或在 VPS 上拉取代码后构建）
cd /path/to/CJMCPAPP
docker build -t cj-mcp-server .
```

### 4.3 运行容器

```bash
docker run -d \
  --name cj-mcp \
  --restart unless-stopped \
  -p 3009:3009 \
  -e CJ_TRANSPORT=http \
  -e CJ_ENV=production \
  -e CJ_HTTP_PORT=3009 \
  cj-mcp-server
```

### 4.4 nginx 反向代理 + SSL

nginx 配置（`/etc/nginx/conf.d/cj-mcp.conf`）：

```nginx
server {
    listen 443 ssl http2;
    server_name mcp.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/mcp.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.yourdomain.com/privkey.pem;

    location /mcp {
        proxy_pass http://localhost:3009/mcp;
        proxy_http_version 1.1;
        # SSE / StreamableHTTP 支持
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 300s;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name mcp.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

申请证书：
```bash
certbot --nginx -d mcp.yourdomain.com
```

ChatGPT 中填入：`https://mcp.yourdomain.com/mcp`

---

## 五、方案C：Railway PaaS（最省事）

1. 注册 [Railway](https://railway.app)
2. 连接 GitHub 仓库
3. 配置环境变量：
   ```
   CJ_TRANSPORT=http
   CJ_ENV=production
   CJ_HTTP_PORT=3000
   PORT=3000
   ```
4. 配置启动命令：`node dist/mcp-server/index.cjs`
5. Railway 自动分配 HTTPS 域名，直接填入 ChatGPT

---

## 六、安全注意事项

1. **不要暴露 CJ 账号密码**：MCP Server 本身通过 verify_credentials 工具接受用户传入凭据，服务器不存储凭据，安全。
2. **Token 文件**：本地 `~/.cj-mcp-token` 不会暴露到服务器，每个用户连接时独立认证。
3. **HTTPS 必须**：ChatGPT 只接受 HTTPS 的 MCP URL，HTTP 仅限本地测试。
4. **防滥用**：生产环境建议在 nginx 层添加 IP 限流或 Bearer Token 鉴权（在 MCP StreamableHTTP 请求头中验证）。

---

## 七、ChatGPT 连接验证

连接成功后，在 ChatGPT 对话中输入：
```
请帮我搜索 iphone case 商品
```

ChatGPT 应该能调用 `search_products` 工具并返回商品列表。

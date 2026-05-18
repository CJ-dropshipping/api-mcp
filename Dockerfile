# CJMCPAPP MCP Server - 生产 Docker 镜像
# 构建: docker build -t cj-mcp-server .
# 运行: docker run -d --name cj-mcp -p 3009:3009 \
#         -e CJ_TRANSPORT=http -e CJ_ENV=production cj-mcp-server

FROM node:20-alpine AS builder

WORKDIR /app

# 先复制依赖文件，利用 Docker 层缓存
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# 复制源码并构建
COPY . .
RUN yarn build

# 生产镜像（不含 devDependencies 和源码）
FROM node:20-alpine AS production

WORKDIR /app

# 只安装生产依赖（MCP SDK）
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# 从 builder 阶段复制构建产物
COPY --from=builder /app/dist ./dist

# 默认端口
EXPOSE 3009

# 健康检查（检查 /health 路由或进程存活）
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:${CJ_HTTP_PORT:-3009}/health 2>/dev/null | grep -q ok || exit 1

# 运行 MCP Server（HTTP 模式，由环境变量控制）
ENV CJ_TRANSPORT=http \
    CJ_ENV=production \
    CJ_HTTP_PORT=3009

CMD ["node", "dist/mcp-server/index.cjs"]

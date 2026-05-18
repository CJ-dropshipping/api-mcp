# CJ MCP Server 重构执行计划

> 生成时间: 2025-06  
> 状态: 待决策 → 待实现

---

## 一、项目目标

基于 OpenAPI 已有接口（28+3个confirmed endpoints），结合 cj-web-egg / mycj-react / mf-components 的业务语境，构建 MCP Server，使 AI 对话能完成 CJ Dropshipping 核心业务操作。

---

## 二、架构设计

```
src/
├── mcp-server/
│   ├── index.ts              # 入口，注册 transport
│   ├── server.ts             # Server 实例 + capabilities
│   ├── tools/                # MCP Tools (按业务域分文件)
│   │   ├── auth.tool.ts      # 登录 (MCP Apps UI)
│   │   ├── product.tool.ts   # 商品查询/分类
│   │   ├── logistics.tool.ts # 运费试算/物流时效
│   │   ├── order.tool.ts     # 下单/购物车/合单
│   │   ├── dispute.tool.ts   # 纠纷管理
│   │   ├── shop.tool.ts      # 店铺授权/查询
│   │   ├── stock.tool.ts     # 仓储/私有库存
│   │   └── navigate.tool.ts  # 生成浏览器链接 (下单/刊登/关联)
│   └── resources/            # MCP Resources (UI)
│       └── login.resource.ts # login.html UI resource
├── api-client/
│   ├── http-client.ts        # axios 封装，自动带 token
│   ├── endpoints.ts          # OpenAPI endpoint 常量
│   └── modules/              # 按 Controller 分模块
│       ├── product.api.ts
│       ├── logistics.api.ts
│       ├── shopping.api.ts
│       ├── disputes.api.ts
│       ├── shop.api.ts
│       ├── stock.api.ts
│       ├── category.api.ts
│       └── auth.api.ts
├── auth/
│   ├── token-store.ts        # (已有) token 持久化
│   └── session.ts            # 登录态管理 + 过期检测
├── config/
│   └── env.ts                # (已有) 环境配置，需补充 OpenAPI 域名
├── ui/
│   └── login.html            # MCP Apps 登录页面
└── types/
    └── ...                   # 类型定义
```

---

## 三、环境配置

| 环境 | OpenAPI 域名 | 前端页面域名 |
|------|-------------|-------------|
| 测试 | `http://test002.cjdropshipping.offline.pre.com/` | `http://www.cjdropshipping.offline.pre.com` |
| 线上 | `https://developers.cjdropshipping.com` | `https://www.cjdropshipping.com` |

通过环境变量 `CJ_ENV=test|production` 切换。

---

## 四、分阶段实施

### Phase 1: 基础框架 + 登录 (P0)

| 步骤 | 任务 | 说明 |
|------|------|------|
| 1.1 | 更新 env.ts | 新增 `openApiBase`(OpenAPI域名) 和 `webBase`(前端页面域名)，按 CJ_ENV 切换 |
| 1.2 | 实现 http-client.ts | axios 封装，自动注入 accessToken header，401 时提示重新登录 |
| 1.3 | 实现 MCP Server 骨架 | server.ts + index.ts，注册 tools/resources capabilities |
| 1.4 | 实现登录 MCP App | 参考 mcp测试/src/server.js 的 ui resource 模式，login.html 参考 mycj/src/provider/commonjs/login.js 的登录逻辑 |
| 1.5 | 实现 session.ts | 登录成功后保存 token+cookie，过期检测，过期时返回提示让用户调用登录 tool |
| 1.6 | auth.api.ts | 调 OpenAPI `/authentication/getAuthorizeUrl` + token 获取 |

### Phase 2: 商品 & 分类查询 (P0)

| 步骤 | 任务 | 对应 OpenAPI 端点 |
|------|------|------------------|
| 2.1 | product.api.ts | `/product/query`, `/product/getCategory`, `/product/globalWarehouseList` |
| 2.2 | category.api.ts | `/category/getCategoryTree` |
| 2.3 | product.tool.ts | Tools: `search_products` / `get_category_tree` / `get_warehouses` |

**Tool 描述示例（中英双语）**:
```
name: "search_products"
description: "搜索CJ商品，支持关键词、分类、价格筛选 / Search CJ products by keyword, category, price range"
```

### Phase 3: 物流 & 运费 (P1)

| 步骤 | 任务 | 对应 OpenAPI 端点 |
|------|------|------------------|
| 3.1 | logistics.api.ts | `/logistic/freightCalculate`, `/logistic/logisticsTimeliness` |
| 3.2 | logistics.tool.ts | Tools: `calculate_freight` / `get_logistics_timeliness` |

### Phase 4: 订单 & 购物车 (P1)

| 步骤 | 任务 | 对应 OpenAPI 端点 |
|------|------|------------------|
| 4.1 | shopping.api.ts | `/shopping/order/addCart`, `/shopping/order/createOrder`, `/shopping/mergeOrder/*`, `/shopping/directOrder/getPayOrderListV3` |
| 4.2 | order.tool.ts | Tools: `add_to_cart` / `create_order` / `merge_orders` / `get_pay_order_list` |
| 4.3 | navigate.tool.ts | `open_order_page` - 生成下单页面链接让用户在浏览器中完成复杂交互 |

### Phase 5: 纠纷管理 (P1)

| 步骤 | 任务 | 对应 OpenAPI 端点 |
|------|------|------------------|
| 5.1 | disputes.api.ts | `/disputes/create`, `/disputes/cancel`, `/disputes/getDisputeList`, `/disputes/disputeConfirmInfo` |
| 5.2 | dispute.tool.ts | Tools: `create_dispute` / `cancel_dispute` / `list_disputes` |

### Phase 6: 店铺 & 库存 (P2)

| 步骤 | 任务 | 对应 OpenAPI 端点 |
|------|------|------------------|
| 6.1 | shop.api.ts | `/shop/getShops`, `/authentication/getAuthorizeUrl` |
| 6.2 | stock.api.ts | `/product/stock/privateInventory/*` (4个端点) |
| 6.3 | shop.tool.ts | `list_shops` / `get_authorize_url` |
| 6.4 | stock.tool.ts | `query_private_inventory` / `query_sku_details` |

### Phase 7: 浏览器链接导航 (P2)

| 步骤 | 任务 | 说明 |
|------|------|------|
| 7.1 | navigate.tool.ts 扩展 | `open_listing_page` - 刊登页面链接 |
| 7.2 | navigate.tool.ts 扩展 | `open_product_connect_page` - 商品关联店铺页面链接 |
| 7.3 | 链接生成逻辑 | 根据环境拼接 webBase + 路由路径，路由参考 cj-web-egg/mycj-react 的 router 配置 |

---

## 五、Tool 设计原则

1. **描述中英双语**: 每个 tool 的 `description` 同时包含中英文，用 ` / ` 分隔
2. **业务语境丰富**: 描述中融入前端业务场景（如 "适用于选品后加入购物车" / "Used after selecting products to add to cart"）
3. **参数提示清晰**: inputSchema 的每个 property 都有中英文 description
4. **登录态检查**: 每个需要认证的 tool 执行前检查 token 有效性，过期则返回 "请先调用 login 工具重新登录 / Please call the login tool to re-authenticate"

---

## 六、登录方案详细设计

```
┌─────────────────────────────────────────────────┐
│  MCP Client (Claude/Cursor等)                    │
│                                                  │
│  1. 用户说"我要登录CJ"                            │
│  2. AI 调用 show_login_form tool                  │
│  3. MCP Client 展示 login.html (MCP Apps UI)      │
│  4. 用户输入账号密码，点登录                        │
│  5. login.html 调用 verify_credentials tool       │
│  6. server 调用 CJ 登录接口获取 token+cookie       │
│  7. token-store 持久化保存                         │
│  8. 返回登录成功                                   │
└─────────────────────────────────────────────────┘
```

- 登录接口参考 `mycj/src/provider/commonjs/login.js`
- Token + Cookie 持久化到本地文件（已有 token-store.ts）
- 每次 API 调用前检查 token 过期时间

---

## 七、决策结果（已确认）

| # | 问题 | 决策 | 实施细节 |
|---|------|------|----------|
| 1 | OpenAPI 调用认证方式 | **用户 token** | 参考 auth.md: 用 apiKey 调用 `/authentication/getAccessToken` 获取 accessToken(15天) + refreshToken(180天)，后续请求 header 带 `CJ-Access-Token: {accessToken}` |
| 2 | MCP Apps 登录接口 | **前端登录接口** | 调用 `userCenterForeignWeb/foreign/webLogin`（参考 cj-web-egg login.js），登录成功后再用返回的 apiKey 换取 OpenAPI accessToken |
| 3 | 多用户支持 | **单用户** | token-store 只维护一份 token 数据 |
| 4 | navigate.tool 链接登录态 | **仅 URL，暂不携带 token** | 🤔 思考：后续可考虑 SSO cookie 共享方案（MCP App 登录后通过 Set-Cookie 写入浏览器同域 cookie，前端页面自动识别） |
| 5 | 测试策略 | **单元测试 + Mock API** | 用 vitest + msw mock 所有 HTTP 调用；后续集成测试通过后再补充 |
| 6 | QPS 限速 | **令牌桶限速** | 3级限速: 查询10QPS / 写操作2QPS / 认证1QPS，全局上限20QPS |

### 认证流程设计（两步式）

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: 前端登录 (MCP App UI)                                │
│   POST userCenterForeignWeb/foreign/webLogin                 │
│   参数: loginName, password(md5加密), timestamp              │
│   返回: userInfo (含 cjLoginToken, apiKey 等)                │
├─────────────────────────────────────────────────────────────┤
│ Step 2: 获取 OpenAPI Token                                   │
│   POST /api2.0/v1/authentication/getAccessToken              │
│   参数: { apiKey: "用户的CJ API Key" }                       │
│   返回: accessToken(15天) + refreshToken(180天)              │
├─────────────────────────────────────────────────────────────┤
│ 后续调用: Header CJ-Access-Token: {accessToken}              │
│ Token续期: POST /api2.0/v1/authentication/refreshAccessToken │
│ 过期提示: accessToken过期 → 尝试refresh → 失败 → 提示重新登录│
└─────────────────────────────────────────────────────────────┘
```

---

## 八、文件依赖关系

```
env.ts (配置) ← http-client.ts (网络) ← *.api.ts (API模块)
                                              ↑
token-store.ts + session.ts (认证) ───────────┘
                                              ↓
                                        *.tool.ts (MCP Tools) → server.ts → index.ts
                                              ↑
                               login.resource.ts + login.html (UI)
```

---

## 九、预计 Tool 清单 (22个)

| # | Tool Name | 业务域 | Phase | 类型 |
|---|-----------|--------|-------|------|
| 1 | show_login_form | 认证 | 1 | MCP App UI |
| 2 | verify_credentials | 认证 | 1 | API调用 |
| 3 | check_login_status | 认证 | 1 | 本地检查 |
| 4 | search_products | 商品 | 2 | API调用 |
| 5 | get_product_detail | 商品 | 2 | API调用 |
| 6 | get_category_tree | 商品 | 2 | API调用 |
| 7 | get_warehouses | 商品 | 2 | API调用 |
| 8 | calculate_freight | 物流 | 3 | API调用 |
| 9 | get_logistics_timeliness | 物流 | 3 | API调用 |
| 10 | add_to_cart | 订单 | 4 | API调用 |
| 11 | create_order | 订单 | 4 | API调用 |
| 12 | merge_orders | 订单 | 4 | API调用 |
| 13 | get_pay_order_list | 订单 | 4 | API调用 |
| 14 | create_dispute | 纠纷 | 5 | API调用 |
| 15 | cancel_dispute | 纠纷 | 5 | API调用 |
| 16 | list_disputes | 纠纷 | 5 | API调用 |
| 17 | list_shops | 店铺 | 6 | API调用 |
| 18 | get_authorize_url | 店铺 | 6 | API调用 |
| 19 | query_private_inventory | 库存 | 6 | API调用 |
| 20 | open_order_page | 导航 | 7 | 链接生成 |
| 21 | open_listing_page | 导航 | 7 | 链接生成 |
| 22 | open_product_connect_page | 导航 | 7 | 链接生成 |

---

## 十、技术栈

- **Runtime**: Node.js (ESM)
- **MCP SDK**: `@modelcontextprotocol/sdk`
- **HTTP**: axios
- **Build**: esbuild
- **Test**: vitest + msw (mock)
- **Language**: TypeScript
- **Transport**: Stdio (标准 MCP 传输)

# MCP 接口覆盖度分析报告

> 生成时间：2026-05-19  
> 分析者：AI 自动分析  
> 参考文档：`cujia-api-platform-website/docs/en/api/api2/api/` 下全部 md 文件  
> 目标：让 AI 对话能准确调用对应 API 接口并正确传参

---

## 一、已实现的 MCP 工具清单（36个）

| 工具名 | 所属文件 | 对应 API |
|--------|----------|---------|
| show_login_form | auth.tool.ts | - |
| verify_credentials | auth.tool.ts | /authentication/getAccessToken |
| check_login_status | auth.tool.ts | - |
| get_rate_limit_status | auth.tool.ts | - |
| logout | auth.tool.ts | - |
| wait_for_login | auth.tool.ts | - |
| search_products | product.tool.ts | GET /product/listV2 |
| get_category_tree | product.tool.ts | GET /product/getCategory *(已修正，原错误填写为 /category/getCategoryTree)* |
| get_warehouses | product.tool.ts | GET /product/globalWarehouseList |
| **get_product_detail** | product.tool.ts | GET /product/query *(新增 2026-05-19)* |
| query_private_inventory | stock.tool.ts | POST /product/stock/privateInventory/querySpuPage |
| query_sku_details | stock.tool.ts | POST /product/stock/privateInventory/querySkuListByProductId |
| query_sku_detail_page | stock.tool.ts | POST /product/stock/privateInventory/querySkuDetailPage |
| calculate_freight | logistics.tool.ts | POST /logistic/freightCalculate |
| get_logistics_timeliness | logistics.tool.ts | POST /logistic/freightCalculateTip *(已修正，/logistic/logisticsTimeliness 不存在)* |
| add_to_cart | order.tool.ts | POST /shopping/order/addCart |
| create_order | order.tool.ts | POST /shopping/order/createOrder |
| merge_orders | order.tool.ts | POST /shopping/mergeOrder/autoMatchMergeOrderListV3 |
| get_merge_progress | order.tool.ts | POST /shopping/mergeOrder/autoMergeQueryProgress |
| get_order_list | order.tool.ts | GET /shopping/order/list |
| get_pay_order_list | order.tool.ts | GET /shopping/order/list?status=UNPAID *(已修正，/shopping/directOrder/getPayOrderListV3 不存在)* |
| create_dispute | dispute.tool.ts | POST /disputes/create |
| cancel_dispute | dispute.tool.ts | POST /disputes/cancel |
| list_disputes | dispute.tool.ts | GET /disputes/getDisputeList |
| get_dispute_detail | dispute.tool.ts | GET /disputes/getDisputeDetail?disputeId=xxx *(已修正，原误用 POST /disputes/disputeConfirmInfo)* |
| list_shops | shop.tool.ts | GET /shop/getShops |
| get_authorize_url | shop.tool.ts | GET /authentication/getAuthorizeUrl |
| open_order_page | navigate.tool.ts | 前端导航 |
| open_listing_page | navigate.tool.ts | 前端导航 |
| open_product_connect_page | navigate.tool.ts | 前端导航 |
| open_shopping_cart | navigate.tool.ts | 前端导航 |

---

## 二、未实现的 API 接口（按优先级）

### 🔴 优先级 1：用户高频需求，强烈建议实现

#### 1. 查询单个订单详情
- **API**: GET `/shopping/order/getOrderDetail`（`/shopping/order/queryOrderInfo` 不存在于API文档，已从 ENDPOINTS 移除）
- **端点**: 已在 `ENDPOINTS.shopping.getOrderDetail` 注册
- **触发场景**: 用户说「查一下订单 D202505XXX 的详情」「这个订单发货了吗」「订单的收货地址是什么」
- **建议工具名**: `get_order_detail`
- **参数**: `orderId`（必填）

#### 2. 查询账户余额
- **API**: GET `/shopping/pay/getBalance`（shopping.md §2.1）
- **触发场景**: 「我的账户余额是多少」「我还有多少钱」「CJ余额」
- **建议工具名**: `get_account_balance`
- **参数**: 无

#### 3. 物流追踪
- **API**: GET `/trackingNumber/getTrackingInfo`（logistic.md §2.2）
- **触发场景**: 「我的包裹到哪了」「追踪单号 XXXX」「这个订单的物流状态」
- **建议工具名**: `get_tracking_info`
- **参数**: `trackingNumber`（快递单号）, `carrierCode`（承运商代码，可选）

#### 4. CJ公开商品库存查询
- **API**: GET `/product/inventoryCenter/queryInventory`（product.md §3.1）  
         GET `/product/inventoryCenter/queryInventoryBySku`（§3.2）  
         GET `/product/inventoryCenter/queryInventoryByProductId`（§3.3）
- **触发场景**: 「这个商品CJ有多少库存」「SKU CJXXX 还有多少货」（注意：不是私有库存，是CJ平台现货）
- **建议工具名**: `query_cj_inventory`
- **参数**: `pid` 或 `productSku` 或 `variantSku`，`countryCode`（可选）

#### 5. 确认纠纷
- **API**: POST `/disputes/disputeConfirmInfo`（端点已注册 ✅）
- **触发场景**: 「确认这个纠纷」「同意纠纷处理结果」
- **工具名**: `confirm_dispute`（已实现）
- **参数**: `orderId`（必填）, `productInfoList`（必填）
- **注意**: `get_dispute_detail` 使用 GET `/disputes/getDisputeDetail`，`confirm_dispute` 使用 POST `/disputes/disputeConfirmInfo`（两者是不同接口）

---

### 🟡 优先级 2：中频需求，建议按需实现

#### 6. 获取账户设置
- **API**: GET `/setting/getSettings`（setting.md §1.1）
- **触发场景**: 「我的账户设置」「默认发货地址」「账户信息」
- **建议工具名**: `get_account_settings`
- **参数**: 无

#### 7. 仓储信息查询
- **API**: GET 仓储信息（storage.md §1.1）
- **触发场景**: 「我的仓库使用情况」「存储空间还有多少」
- **建议工具名**: `get_storage_info`
- **参数**: 无

#### 8. 按SKU查询私有库存SKU明细
- **API**: POST `/product/stock/privateInventory/querySkuDetailListBySku`（端点已注册，未绑定工具）
- **触发场景**: 「查一下 SKU CJXXX-Black 的私有库存明细」
- **建议工具名**: `query_sku_detail_by_sku`（补充 stock.tool.ts）
- **参数**: `variantSku`（必填）

#### 9. 我的商品列表
- **API**: GET `/product/myProduct/list`（product.md §1.4 My Product List）
- **触发场景**: 「我保存的商品」「我的选品列表」
- **建议工具名**: `get_my_products`
- **参数**: `pageNum`, `pageSize`, `keyword`

#### 10. 商品变体查询
- **API**: GET `/product/variant/query`（product.md §2.1 All Variants）  
         GET `/product/variant/queryVariantById`（§2.2）
- **触发场景**: 「这个商品有哪些颜色和尺码」「获取变体列表」
- **建议工具名**: `get_product_variants`
- **参数**: `pid`（必填）

#### 11. 确认/取消/删除订单
- **API**: PATCH `/shopping/order/confirm`（shopping.md §1.5）  
         DELETE `/shopping/order/delete`（shopping.md §1.4）
- **触发场景**: 「确认订单 D202505XXX」「取消这个订单」「删除订单」
- **建议工具名**: `confirm_order`, `delete_order`
- **参数**: `orderId`

---

### ⚪ 优先级 3：低频或特殊场景，视需要实现

#### 12. 采购需求（Sourcing）
- **API**: POST `/product/sourcing/create`（product.md §5.1）  
         POST `/product/sourcing/query`（§5.2）
- **触发场景**: 「帮我采购 XXXX」「提交一个采购需求」
- **建议工具名**: `create_sourcing`, `query_sourcing`

#### 13. 商品与店铺连接管理
- **API**: GET/POST/DELETE `/product/productConnection/...`（product.md §6）
- **触发场景**: 「查看我的商品连接」「创建商品连接」「断开商品连接」
- **建议工具名**: `list_product_connections`, `create_product_connection`, `disconnect_product`

#### 14. 保存商品到店铺
- **API**: POST `/shop/saveProduct`, POST `/shop/saveVariantBatch`（shop.md §2）
- **触发场景**: 「把这个商品保存到我的 Shopify 店铺」

#### 15. 上传/更新发货信息
- **API**: POST `/shopping/shippingInfo/uploadShippingInfo`（shopping.md §3.1）  
         POST `/shopping/shippingInfo/updateShippingInfo`（§3.2）
- **触发场景**: 「上传快递单号」「更新发货信息」

#### 16. COGS 成本查询
- **API**: POST `/shopping/cogs/queryCogsBasicDataOrderInfo`（shopping.md §4.1）
- **触发场景**: 「查一下这批订单的采购成本」

#### 17. 以图搜货
- **API**: POST `/product/queryProductsByImage`（product.md §7.1）
- **触发场景**: 「我有一张图，帮我找类似的商品」

#### 18. 商品评价查询
- **API**: GET `/product/review/query`（product.md §4.1-4.2）
- **触发场景**: 「这个商品的评价怎么样」

#### 19. Webhook 设置
- **API**: POST `/webhook/setting`（webhook.md §1.1）
- **触发场景**: 「设置我的 Webhook 消息通知」

#### 20. 物流试算（增强版）
- **API**: POST `/logistic/freightCalculateTip`（logistic.md §1.2）
- **触发场景**: 已有 calculate_freight，此为补充 tip 版本

#### 21. ~~收货国家信息~~（已移除）
- **API**: ~~GET `/product/listed/getReceiverCountryInfo`~~ — ❌ **该接口不存在于API文档，已从 ENDPOINTS 移除**
- **触发场景**: 不适用

---

## 三、参数优化建议（现有工具）

| 工具 | 问题 | 建议 |
|------|------|------|
| `get_order_list` | 缺少按时间范围筛选参数（startTime/endTime）| 可添加 |
| `query_private_inventory` | 已有 warehouseId，但 countryCode 未知是否 API 支持 | 需实测验证 warehouseId 是否有效 |
| `calculate_freight` | 缺少仓库来源（fromCountry）参数 | 参考 logistic.md 补充 |
| `get_order_list` | orderIds 支持精确查询，但无单订单详情工具 | 建议新增 get_order_detail |

---

## 四、建议实施顺序

```
第1批（核心高频）: get_order_detail, get_account_balance, get_tracking_info
第2批（补充查询）: query_cj_inventory, get_account_settings, query_sku_detail_by_sku
第3批（操作类）:   confirm_order, delete_order, confirm_dispute
第4批（高级功能）: get_my_products, get_product_variants, create_sourcing
第5批（集成功能）: product_connection, save_to_shop, upload_shipping_info
```

---

*报告由 GitHub Copilot 自动生成，基于 docs/en/api/api2/api/ 文档分析*

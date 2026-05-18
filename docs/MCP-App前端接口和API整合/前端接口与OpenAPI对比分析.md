# 前端接口与 Open API 对比分析

> 生成时间：2026-05-13
> 对比范围：cj-web-egg、mf-components、mycj-react 前端接口 vs cujia-api-platform-website/docs 文档 vs cj-openapi-rest 已实现接口

---

## 一、总体统计

| 维度 | 数量 |
|------|------|
| 前端项目 API 调用接口总数 | ~600+ |
| Open API 已有文档接口 | 46 |
| Open API 已实现 Java 接口 | 68+ |
| 已实现但未文档化的接口 | ~22 |
| 前端调用但 Open API 未覆盖的接口 | ~500+ |

---

## 二、接口分类总结

根据对比分析，前端项目中的接口可以分为以下 **6 大类型**：

### 类型 A：Open API 已实现 + 已有文档（无需处理）
### 类型 B：Open API 已实现但文档缺失（需补文档）
### 类型 C：前端有调用、适合开放为 Open API（需实现+文档）
### 类型 D：内部管理类接口（不适合开放）
### 类型 E：第三方/基础设施类（不适合开放）
### 类型 F：已废弃/重复接口（无需处理）

---

## 三、类型 A：已实现 + 已文档化（46 个）

> 这些接口已完整，无需额外处理。

| # | 接口路径 | 方法 | 说明 |
|---|---------|------|------|
| 1 | /v1/authentication/getAccessToken | POST | 获取令牌 |
| 2 | /v1/authentication/refreshAccessToken | POST | 刷新令牌 |
| 3 | /v1/authentication/logout | POST | 注销 |
| 4 | /v1/product/getCategory | GET | 商品分类 |
| 5 | /v1/product/list | GET | 商品列表 |
| 6 | /v1/product/listV2 | GET | 商品列表V2 |
| 7 | /v1/product/query | GET | 商品详情 |
| 8 | /v1/product/globalWarehouseList | GET | 全球仓库列表 |
| 9 | /v1/product/addToMyProduct | POST | 添加到我的商品 |
| 10 | /v1/product/myProduct/query | GET | 我的商品查询 |
| 11 | /v1/product/variant/query | GET | 变体查询 |
| 12 | /v1/product/variant/queryByVid | GET | 按VID查变体 |
| 13 | /v1/product/stock/queryByVid | GET | 按VID查库存 |
| 14 | /v1/product/stock/queryBySku | GET | 按SKU查库存 |
| 15 | /v1/product/stock/getInventoryByPid | GET | 按商品ID查库存 |
| 16 | /v1/product/comments | GET | 商品评论 |
| 17 | /v1/product/productComments | GET | 商品评论(alt) |
| 18 | /v1/product/sourcing/create | POST | 创建Sourcing请求 |
| 19 | /v1/product/stock/privateInventory/querySpuPage | POST | 私有库存SPU查询 |
| 20 | /v1/product/stock/privateInventory/querySkuListByProductId | POST | 私有库存SKU列表 |
| 21 | /v1/product/stock/privateInventory/querySkuDetailPage | POST | 私有库存SKU详情 |
| 22 | /v1/product/stock/privateInventory/querySkuDetailListBySku | POST | 私有库存按SKU查 |
| 23 | /v1/warehouse/detail | GET | 仓库详情 |
| 24 | /v1/storehouseCenterWeb/syncStorehouseVideoRequests | POST | 同步仓库视频 |
| 25 | /v1/shopping/order/createOrder | POST | 创建订单V2 |
| 26 | /v1/shopping/order/createOrderV3 | POST | 创建订单V3 |
| 27 | /v1/shopping/order/list | GET | 订单列表 |
| 28 | /v1/shopping/order/getOrderDetail | GET | 订单详情 |
| 29 | /v1/shopping/order/deleteOrder | DEL | 删除订单 |
| 30 | /v1/shopping/order/confirmOrder | PATCH | 确认订单 |
| 31 | /v1/shopping/order/addCart | POST | 加入购物车 |
| 32 | /v1/shopping/order/addCartConfirm | POST | 确认购物车 |
| 33 | /v1/shopping/order/queryCogsBasicDataOrderInfoList | POST | COGS基础数据 |
| 34 | /v1/shopping/mergeOrder/autoMatchMergeOrderListV3 | POST | 自动匹配合单 |
| 35 | /v1/shopping/mergeOrder/autoMergeQueryProgress | POST | 合单进度查询 |
| 36 | /v1/shopping/mergeOrder/autoMergeQueryResult | POST | 合单结果查询 |
| 37 | /v1/shopping/mergeOrder/submitMergeOrderBatchV3 | POST | 提交合单 |
| 38 | /v1/shopping/mergeOrder/submitProgress | POST | 提交进度 |
| 39 | /v1/shopping/mergeOrder/submitResult | POST | 提交结果 |
| 40 | /v1/shopping/pay/getBalance | GET | 获取余额 |
| 41 | /v1/shopping/pay/payBalance | POST | 余额支付 |
| 42 | /v1/shopping/sandbox/simulatePay | POST | 沙箱模拟支付 |
| 43 | /v1/shopping/sandbox/updateStatus | POST | 沙箱更新状态 |
| 44 | /v1/logistic/freightCalculate | POST | 运费计算 |
| 45 | /v1/logistic/freightCalculateTip | POST | 运费计算(高级) |
| 46 | /v1/disputes/disputeProducts | GET | 纠纷商品 |
| 47 | /v1/disputes/disputeConfirmInfo | POST | 确认纠纷信息 |
| 48 | /v1/disputes/create | POST | 创建纠纷 |
| 49 | /v1/disputes/cancel | POST | 取消纠纷 |
| 50 | /v1/disputes/getDisputeList | GET | 纠纷列表 |
| 51 | /v1/disputes/getDisputeDetail | GET | 纠纷详情 |
| 52 | /v1/webhook/set | POST | 设置Webhook |
| 53 | /v1/setting/get | GET | 获取设置 |
| 54 | /v1/shop/getShops | GET | 店铺列表 |
| 55 | /v1/store/product/saveProduct | POST | 保存店铺商品 |
| 56 | /v1/store/product/saveVariantBatch | POST | 批量保存变体 |

---

## 四、类型 B：已实现但文档缺失（~22 个）

> 这些接口已在 cj-openapi-rest 中实现，但 cujia-api-platform-website/docs 中没有对应文档。需要补充文档。

| # | 接口路径 | 方法 | 说明 | 所属Controller |
|---|---------|------|------|---------------|
| 1 | /v1/authentication/getAuthorizeUrl | POST | 获取授权URL | AuthenticationController |
| 2 | /v1/authentication/exchangeAccessToken | POST | 交换令牌 | AuthenticationController |
| 3 | /v1/authentication/getAffiliateAccessToken | POST | 获取联盟令牌 | AuthenticationController |
| 4 | /v1/product/queryProductInfo | GET | 查询商品信息(带参数) | ProductController |
| 5 | /v1/shopping/pay/payBalanceV2 | POST | 余额支付V2 | ShoppingController |
| 6 | /v1/shopping/pay/refund | POST | 退款 | ShoppingController |
| 7 | /v1/shopping/order/createOrderV2 | POST | 创建订单V2(新) | ShoppingController |
| 8 | /v1/shopping/order/orderWarehouseWed2c | POST | 仓库订单(w2c) | ShoppingController |
| 9 | /v1/shopping/order/interceptOrder | POST | 拦截订单(马帮) | ShoppingController |
| 10 | /v1/shopping/directOrder/getPayOrderListV3 | POST | 直接订单付款列表V3 | ShoppingController |
| 11 | /v1/shopping/order/queryOrderInfo | POST | 查询订单信息 | ShoppingController |
| 12 | /v1/shopping/order/queryOrderLog | POST | 查询订单日志 | ShoppingController |
| 13 | /v1/shopping/order/supplier/batchGroupSKUSV3 | POST | 批量分组SKU(供应商) | ShoppingController |
| 14 | /v1/logistic/supplierfreightCalculate | POST | 供应商运费计算 | LogisticController |
| 15 | /v1/logistic/trackInfo | GET | 物流追踪信息 | LogisticController |
| 16 | /v1/logistic/partnerFreightCalculate | POST | 合作伙伴运费 | LogisticController |
| 17 | /v1/logistic/getSupplierLogisticsTemplate | POST | 供应商物流模板 | LogisticController |
| 18 | /v1/logistic/logisticsTimeliness | GET | 物流时效 | LogisticController |
| 19 | /v1/logistic/selectlogisticsCompanyPlatform | POST | 选择物流公司平台 | LogisticController |
| 20 | /v1/logistic/getSupplierLogisticsTemplateV3 | POST | 供应商物流模板V3 | LogisticController |
| 21 | /v1/product/stock/getInventoryByPidAndCountry | GET | 按商品+国家查库存 | StockController |
| 22 | /v1/product/stock/getInventoryByPidsAndCountry | GET | 批量按国家查库存 | StockController |

---

## 五、类型 C：前端有调用、适合开放为 Open API（核心需求）

> 以下接口在前端项目中频繁使用，对第三方开发者有价值，适合开放。按业务域分组：

### C1. 订单管理域（~50 个接口）

前端使用最多的模块（mycj-react 中 230+ 个接口），核心功能包括：

| 子类 | 接口数 | 示例接口 | 说明 |
|------|--------|---------|------|
| 订单管理 | ~23 | pageOrderStatusAll, getOrderDetailV2 | 订单查询、筛选、取消等 |
| 购物车 | ~39 | addCartV5, pagePurchaseOrderV2 | 购物车增删改查、物流选择 |
| 已完成订单 | ~32 | orderListV4, getComposeDetail | 完成单查询、导出、改地址 |
| 未完成订单 | ~12 | list, exportInCompletedOrderV2 | 未完成单查看、导出 |
| 确认订单 | ~23 | listServiceFeeDetail, confirmDeduction | 确认扣款、费用明细 |
| 回收站 | ~8 | list, restoreBatchV3 | 删除恢复 |
| 订单导出 | ~8 | exportOrderStatusAll, exportShipped | 各状态订单导出 |
| 草稿订单 | ~5 | getInfoByDraft | 草稿箱 |

### C2. COGS / 成本分析域（~6 个接口）

| 接口路径 | 说明 |
|---------|------|
| /cogs-service/cogsSearch/listV3 | COGS搜索列表V3 |
| /cogs-service/cogsSearch/exportListV3 | COGS导出V3 |
| /cogs-service/cogsSearch/downloadExcelFile | 下载Excel |
| /cogs-service/cogsSearch/exportJobStatus | 导出状态 |
| /cogs-service/cogsSet/getCogsCustom | 获取COGS自定义设置 |
| /cogs-service/cogsSet/updateCogsCustom | 更新COGS自定义设置 |

### C3. 物流域（~8 个接口）

| 接口路径 | 说明 |
|---------|------|
| /order-center/proxyOrder/logistics/getCountryList | 获取国家列表 |
| /order-center/proxyOrder/logistics/getOrderLogisticsTrialV4 | 物流试算V4 |
| /order-center/proxyOrder/logistics/getLogisticsDetailV2 | 物流详情V2 |
| /order-center/proxyOrder/logistics/selectLogisticsDiscount | 物流折扣选择 |
| /order-center/proxyOrder/completedOrder/getComposeDetail | 包裹组合详情 |
| /order-center/proxyOrder/completedOrder/getOrderThirdList | 第三方物流信息 |
| /order-center/proxyOrder/orderManagement/getOrderLogisticsDetailV2 | 订单物流追踪 |
| /storehouse-center-api/areaInfo/getCountryByAreaId | 仓库国家信息 |

### C4. 商品域（~80 个接口，cj-web-egg）

| 子类 | 接口数 | 说明 |
|------|--------|------|
| 商品搜索 | ~10 | ES搜索v4/v5、趋势搜索、RTS搜索 |
| 商品详情 | ~5 | 详情v2/v3、媒体链接 |
| 分类 | ~3 | 分类树、SEO信息 |
| 排行/推荐 | ~5 | 排行榜、商品推荐 |
| POD定制 | ~4 | POD商品列表、个性化分类 |
| 仓库 | ~6 | 全球仓库列表、供应商仓库 |
| 内容/活动 | ~15 | 活动页商品、内容详情 |
| 视频 | ~2 | 视频列表 |

### C5. 消息通知域（~10 个接口）

| 接口路径 | 说明 |
|---------|------|
| messageCenterCj/notification/queryGetCjnotification | CJ通知查询 |
| messageCenterCj/notification/queryNoticeUpperApex | 未读数量 |
| messageCenterCj/notification/queryCjInformMap | 通知分类 |
| messageCenterCj/notification/updateRead | 标记已读 |
| cj/appPush/getCJPushInfoListByUserId | 推送消息列表 |
| cj/appPush/updateAppPushIsRead | 标记推送已读 |

### C6. 用户/账户域（~10 个接口）

| 接口路径 | 说明 |
|---------|------|
| userCenterForeignWeb/accountManager/list | 账户经理列表 |
| userCenterForeignWeb/accountManager/detail | 账户经理详情 |
| userCenterForeignWeb/accountManagerOrder/create | 创建付费服务订单 |
| userCenterForeignWeb/subscribe/getUserSubscribeList | 订阅列表 |
| userCenterForeignWeb/agreementAgreed/submit | 协议确认 |

---

## 六、类型 D：内部管理类接口（不适合开放）

> 这些接口用于内部运营、管理后台，不适合作为 Open API 开放给第三方。

| 子类 | 接口数 | 说明 |
|------|--------|------|
| 供应商管理 | ~10 | SupplierProductController, SupplierOrderController |
| ERP集成 | ~5 | ErpSupplierIntervalController |
| 平台调用统计 | ~3 | PlatformApiCallController, ApiCallLimiterController |
| 员工/用户管理 | ~5 | UserController, ContactController |
| 客服系统 | ~3 | CustomerServiceController |
| 运营专区 | ~5 | cjOperationZone 相关 |

---

## 七、类型 E：第三方/基础设施类（不适合开放）

| 子类 | 说明 |
|------|------|
| 翻译服务 | cj-translation-api 相关 |
| 加密/安全 | encryptConfig/getSecretKey |
| 第三方登录 | WhatsApp/Facebook 登录 |
| OSS文件上传 | ossController |
| Chat客服 | chat-web 相关 |
| 静态配置JSON | Country.json, siteUserPermission.json |

---

## 八、类型 F：已废弃/重复接口

| 接口 | 说明 |
|------|------|
| /v1/logistic/getTrackInfo | 2024-07-01 废弃，已被 trackInfo 替代 |
| /v1/product/productComments | 与 comments 重复 |
| /v1/shopping/order/createOrder | 已有 V2/V3 版本 |

---

## 九、后续建议优先级

| 优先级 | 类型 | 工作量 | 说明 |
|--------|------|--------|------|
| P0 | 类型B - 补文档 | 小 | 22个已实现接口只需写文档，无需开发 |
| P1 | 类型C - 订单管理 | 大 | 核心业务域，第三方最需要 |
| P2 | 类型C - COGS成本 | 中 | 数据分析类，差异化竞争力 |
| P3 | 类型C - 物流详情 | 中 | 补充现有物流域 |
| P4 | 类型C - 商品搜索增强 | 中 | ES搜索能力开放 |
| P5 | 类型C - 消息通知 | 小 | Webhook 补充 |

---

## 十、前端项目 API 分布概况

```
mycj-react (265 个唯一路径):
├── order-center/proxyOrder/  (230+ 接口)
│   ├── shoppingCart/       39 个
│   ├── completedOrder/     32 个
│   ├── orderManagement/    23 个
│   ├── confirmOrder/       23 个
│   ├── saveOrder/          17 个
│   ├── manageOrder/        14 个
│   ├── inCompletedOrder/   12 个
│   ├── orderProduct/       10 个
│   ├── recycle/            8 个
│   ├── orderManagementExport/ 8 个
│   ├── logistics/          8 个
│   ├── userConfig/         6 个
│   └── 其他                20+ 个
├── cogs-service/           6 个
├── cjorder-web/            6 个
└── 其他                    20+ 个

cj-web-egg (~80 个唯一路径):
├── elastic-api/            40+ 个 (ES搜索相关)
├── product-api/            20+ 个 (商品详情)
├── storehouse-center-api/  3 个
├── userCenterForeignWeb/   10 个
└── 其他                    10+ 个

mf-components (~30 个唯一路径):
├── messageCenterCj/        5 个
├── order-center/           8 个
├── userCenterForeignWeb/   5 个
├── affiliate-center-web/   3 个
└── 其他                    10+ 个
```

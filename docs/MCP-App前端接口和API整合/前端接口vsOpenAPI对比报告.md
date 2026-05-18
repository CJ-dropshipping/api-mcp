# 前端接口 vs OpenAPI 实现对比报告

> 生成时间: 2025年  
> 数据来源: apiv3.csv (1096条前端接口) vs cj-openapi-rest 控制器 (142个OpenAPI端点)

## 一、总体结论

| 分类 | 数量 | 占比 |
|------|------|------|
| OpenAPI已实现+已有文档 | 28 | 2.6% |
| OpenAPI部分实现 | 3 | 0.3% |
| OpenAPI未实现 | 1065 | 97.1% |
| **合计** | **1096** | 100% |

**核心发现**: 前端使用的1096个接口中，仅31个(2.8%)在 `cj-openapi-rest` 中有确认的对应实现。绝大多数前端接口调用的是内部微服务，未暴露为外部OpenAPI。

---

## 二、确认已实现的接口清单 (31个)

### 已实现+已有文档 (28个)

| # | 前端接口 | OpenAPI对应端点 | Controller |
|---|----------|----------------|------------|
| 1 | POST /cj-platform-web/shop/getAuthorizeUrl | /authentication/getAuthorizeUrl | AuthenticationController |
| 2 | POST /cujiaLogisticsFreight/freight/logistics/getFreightStepOne/v2 | /logistic/freightCalculate | LogisticController |
| 3 | POST /cujiaLogisticsFreight/freight/logistics/getLogisticsDiscountPrice/v4 | /logistic/freightCalculate | LogisticController |
| 4 | POST /cujiaLogisticsFreight/freight/logistics/getReceiverCountryInfo | /product/listed/getReceiverCountryInfo | ProductListedController |
| 5 | POST /product-api/product/user/getUserProductInfo | /product/query | ProductController |
| 6 | POST /product-api/baseCategory/queryOneLeverCategoryList | /product/getCategory | ProductController |
| 7 | POST /product-api/baseCategory/getCategoryTree | /category/getCategoryTree | CategoryController |
| 8 | POST /cjorder-web/disputeRefund/cancelDispute | /disputes/cancel | DisputesController |
| 9 | POST /cjorder-web/disputeNew/cancelNewDispute | /disputes/cancel | DisputesController |
| 10 | POST /cjorder-web/disputeRefund/getDirectDisputeList | /disputes/getDisputeList | DisputesController |
| 11 | POST /cjorder-web/disputeRefund/openDispute | /disputes/create | DisputesController |
| 12 | POST /cjorder-web/disputeNew/disputeConfirmInfo | /disputes/disputeConfirmInfo | DisputesController |
| 13 | POST /cjorder-web/disputeNew/getNewDisputeList | /disputes/getDisputeList | DisputesController |
| 14 | POST /order-center/mergeOrder/autoMatchMergeOrderListV3 | /shopping/mergeOrder/autoMatchMergeOrderListV3 | ShoppingController |
| 15 | POST /order-center/mergeOrder/autoMergeQueryResult | /shopping/mergeOrder/autoMergeQueryResult | ShoppingController |
| 16 | POST /order-center/mergeOrder/autoMergeQueryProgress | /shopping/mergeOrder/autoMergeQueryProgress | ShoppingController |
| 17 | POST /order-center/mergeOrder/submitMergeOrderBatchV3 | /shopping/mergeOrder/submitMergeOrderBatchV3 | ShoppingController |
| 18 | POST /order-center/mergeOrder/submitProgress | /shopping/mergeOrder/submitProgress | ShoppingController |
| 19 | POST /order-center/mergeOrder/submitResult | /shopping/mergeOrder/submitResult | ShoppingController |
| 20 | POST /order-center/proxyOrder/shoppingCart/addCartV5 | /shopping/order/addCart | ShoppingController |
| 21 | POST /order-center/proxyOrder/shoppingCart/addCartV6 | /shopping/order/addCart | ShoppingController |
| 22 | POST /cjorder-web/directOrder/getPayOrderListV3 | /shopping/directOrder/getPayOrderListV3 | ShoppingController |
| 23 | POST /cjorder-web/viewOrder/createOrder | /shopping/order/createOrder | ShoppingController |
| 24 | GET /elastic-api/warehouse/globalWarehouseList | /product/globalWarehouseList | StockController |
| 25 | POST /api/privateInventory/querySkuDetailListBySkuPc | /product/stock/privateInventory/querySkuDetailListBySku | StockController |
| 26 | POST /api/privateInventory/querySkuDetailPagePc | /product/stock/privateInventory/querySkuDetailPage | StockController |
| 27 | POST /api/privateInventory/querySpuPagePc | /product/stock/privateInventory/querySpuPage | StockController |
| 28 | POST /api/privateInventory/querySkuListByProductIdPc | /product/stock/privateInventory/querySkuListByProductId | StockController |

### 部分实现 (3个)

| # | 前端接口 | OpenAPI对应端点 | 说明 |
|---|----------|----------------|------|
| 1 | GET /cujiaLogisticsFreight/operation/getLogisticsWay | /logistic/logisticsTimeliness | 功能相似但参数不同 |
| 2 | POST /cj-platform-web/shop/queryShopList | /shop/getShops | OpenAPI只返回基本列表 |
| 3 | POST /supplier-center-web/supplierPlanInfo/getSupplierArea | /supplierproduct/selectSupplierAccountAreaInfo | 数据范围不同 |

---

## 三、未实现接口的分类（按服务前缀）

| 服务前缀 | 未实现接口数 | 业务描述 | 建议处理方式 |
|----------|-------------|----------|-------------|
| **order-center** | 220 | 订单全生命周期管理(创建/修改/拆合单/确认/履约) | 选择核心操作开放(createOrder/orderList/orderDetail已有,需补充确认/履约) |
| **cj-platform-web** | 70 | 平台店铺管理(授权/同步/库存/商品上架) | 高价值-店铺连接是核心流程,需新增connection/listing相关OpenAPI |
| **payment-center-web** | 65 | 支付/钱包/账单管理 | 中等-已有payBalance/refund/getBalance,无需全部开放 |
| **product-api** | 64 | 商品内部操作(关联/关注/标签/视频) | 低-内部管理操作,外部开发者不需要 |
| **userCenterForeignWeb** | 34 | 用户账户/代理商管理 | 低-账户管理属内部运营 |
| **cj-logistics-api** | 29 | 物流规则/面单/包裹管理 | 中等-物流查询已覆盖,面单管理可按需开放 |
| **quick-search-product-center** | 26 | 商品快速搜索服务 | 低-已有product/listV2覆盖搜索需求 |
| **cjorder-web** | 24 | 订单纠纷/查看/导出 | 中等-纠纷已覆盖6个端点,查看/导出可按需补充 |
| **elastic-api** | 22 | Elasticsearch商品搜索 | 低-product/listV2已覆盖,内部ES查询不需暴露 |
| **cujiaLogisticsFreight** | 20 | 运费试算/PCS计价 | 中等-freightCalculate已有,试算工具可选开放 |
| **cogs-service** | 9 | 成本核算(COGS) | 低-内部财务报表,外部不需要 |
| **storehouse-center-web** | 9 | 仓储中心管理 | 低-内部仓储操作 |
| 其他(cj/app/erp等) | 39 | 杂项内部服务 | 低-按需评估 |

---

## 四、OpenAPI控制器覆盖范围 (142个端点)

| Controller | 前缀 | 端点数 | 覆盖的前端服务 |
|------------|------|--------|---------------|
| ProductController | /product | 24 | product-api, elastic-api |
| StockController | /product/stock | 8 | elastic-api/warehouse, api/privateInventory |
| ShoppingController | /shopping | 30 | order-center, cjorder-web |
| LogisticController | /logistic | 10 | cujiaLogisticsFreight, cj-logistics-api |
| AuthenticationController | /authentication | 6 | (前端通常不直接调用) |
| DisputesController | /disputes | 6 | cjorder-web/dispute* |
| SupplierProductController | /supplierproduct | 12 | supplier-center-web |
| SupplierOrderController | /supplierOrder | 6 | (供应商端) |
| ProductListedController | /product/listed | 9 | cj-platform-web/product |
| ConnectionController | /product/conn | 3 | cj-platform-web/shop |
| ShopController | /shop | 1 | cj-platform-web/shop |
| Others | mixed | 27 | various |

---

## 五、需要后续处理的几类接口

### 类型A: 已有OpenAPI端点但前端用内部路径调用 (需要适配)
- 场景: 前端调 `order-center/mergeOrder/xxx`，OpenAPI已有 `shopping/mergeOrder/xxx`
- 数量: ~31个已确认
- 处理: App端直接使用OpenAPI端点，无需新开发

### 类型B: OpenAPI有相关Controller但缺少对应方法 (需要补充实现)
- 场景: 前端调 `order-center/proxyOrder/confirmOrder/confirmDeductionV4`，OpenAPI ShoppingController只有基础 `confirmOrder`
- 代表: 订单确认流程细节(扣款/进度查询)、合单V2版本、POD编辑等
- 估计: ~80个高价值接口
- 处理: 在对应Controller中新增方法

### 类型C: OpenAPI完全没有对应Controller (需要新建)
- 场景: payment-center(65个), userCenter(34个), cogs(9个)
- 代表: 钱包充值/流水查询、用户信息管理、成本报表
- 处理: 评估外部开发者是否需要 → 需要的新建Controller

### 类型D: 纯内部服务，不需要暴露为OpenAPI
- 场景: 后台管理、运营工具、内部数据同步
- 代表: crm/erp/admin相关、数据埋点、消息通知
- 估计: ~700+个
- 处理: 保持内部使用，不开放

---

## 六、对比方法说明

1. **数据源**: 
   - 前端: mycj-react(955) + cj-web-egg(72) + mf-components(69) = 1096个接口
   - OpenAPI: `cj-openapi-rest/src/main/java/com/cj/openapi/start/web/controller/` 28个Controller共142个端点

2. **匹配策略**: 
   - 精确映射: 人工确认的URL对应关系(如 `mergeOrder/submitMergeOrderBatchV3` 在两端完全一致)
   - 函数名匹配: 前端URL最后一段与OpenAPI方法名完全一致(长度>8且非通用词)
   - 只有高置信度匹配才标记为"已实现"

3. **脚本路径**: `tmp/verify-openapi-status.cjs`

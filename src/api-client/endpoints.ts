/**
 * @fileoverview OpenAPI 端点常量
 * 基于 cj-openapi-rest 控制器中确认的 142 个端点
 * API版本前缀: /api2.0/v1
 */

export const API_VERSION_PREFIX = '/api2.0/v1';

export const ENDPOINTS = {
  // === Authentication ===
  auth: {
    getAccessToken: '/authentication/getAccessToken',
    refreshAccessToken: '/authentication/refreshAccessToken',
    getAuthorizeUrl: '/authentication/getAuthorizeUrl',
  },

  // === Product ===
  product: {
    query: '/product/query',
    listV2: '/product/listV2',
    getCategory: '/product/getCategory',
    globalWarehouseList: '/product/globalWarehouseList',
    variantQuery: '/product/variant/query',
    myProductQuery: '/product/myProduct/query',
    stockQueryByVid: '/product/stock/queryByVid',
    stockQueryBySku: '/product/stock/queryBySku',
    stockGetInventoryByPid: '/product/stock/getInventoryByPid',
    sourcingCreate: '/product/sourcing/create',
    sourcingQuery: '/product/sourcing/query',
    connList: '/product/conn/connection',
    productComments: '/product/productComments',
    imageSearch: '/product/queryProductsByImage',
  },

  // === Logistic ===
  logistic: {
    freightCalculate: '/logistic/freightCalculate',
    trackInfo: '/logistic/trackInfo',
    freightCalculateTip: '/logistic/freightCalculateTip',
  },

  // === Shopping / Order ===
  shopping: {
    addCart: '/shopping/order/addCart',
    createOrder: '/shopping/order/createOrder',
    mergeOrderAutoMatch: '/shopping/mergeOrder/autoMatchMergeOrderListV3',
    mergeOrderAutoResult: '/shopping/mergeOrder/autoMergeQueryResult',
    mergeOrderAutoProgress: '/shopping/mergeOrder/autoMergeQueryProgress',
    mergeOrderSubmit: '/shopping/mergeOrder/submitMergeOrderBatchV3',
    mergeOrderSubmitProgress: '/shopping/mergeOrder/submitProgress',
    mergeOrderSubmitResult: '/shopping/mergeOrder/submitResult',
    listOrder: '/shopping/order/list',
    getOrderDetail: '/shopping/order/getOrderDetail',
    getBalance: '/shopping/pay/getBalance',
    deleteOrder: '/shopping/order/deleteOrder',
    confirmOrder: '/shopping/order/confirmOrder',
    queryCogs: '/shopping/order/queryCogsBasicDataOrderInfoList',
  },

  // === Disputes ===
  disputes: {
    create: '/disputes/create',
    cancel: '/disputes/cancel',
    getDisputeList: '/disputes/getDisputeList',
    getDisputeDetail: '/disputes/getDisputeDetail',
    disputeConfirmInfo: '/disputes/disputeConfirmInfo',
  },

  // === Shop ===
  shop: {
    getShops: '/shop/getShops',
  },

  // === Setting ===
  setting: {
    get: '/setting/get',
  },

  // === Warehouse ===
  warehouse: {
    detail: '/warehouse/detail',
  },

  // === Store ===
  store: {
    saveProduct: '/store/product/saveProduct',
  },

  // === Webhook ===
  webhook: {
    set: '/webhook/set',
  },

  // === Stock / Warehouse ===
  stock: {
    querySpuPage: '/product/stock/privateInventory/querySpuPage',
    querySkuDetailPage: '/product/stock/privateInventory/querySkuDetailPage',
    querySkuDetailListBySku: '/product/stock/privateInventory/querySkuDetailListBySku',
    querySkuListByProductId: '/product/stock/privateInventory/querySkuListByProductId',
  },

} as const;

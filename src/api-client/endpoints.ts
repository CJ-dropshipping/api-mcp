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
  },

  // === Category ===
  category: {
    getCategoryTree: '/category/getCategoryTree',
  },

  // === Logistic ===
  logistic: {
    freightCalculate: '/logistic/freightCalculate',
    logisticsTimeliness: '/logistic/logisticsTimeliness',
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
    getPayOrderListV3: '/shopping/directOrder/getPayOrderListV3',
    listOrder: '/shopping/order/list',
    getOrderDetail: '/shopping/order/getOrderDetail',
    queryOrderInfo: '/shopping/order/queryOrderInfo',
  },

  // === Disputes ===
  disputes: {
    create: '/disputes/create',
    cancel: '/disputes/cancel',
    getDisputeList: '/disputes/getDisputeList',
    disputeConfirmInfo: '/disputes/disputeConfirmInfo',
  },

  // === Shop ===
  shop: {
    getShops: '/shop/getShops',
  },

  // === Stock / Warehouse ===
  stock: {
    querySpuPage: '/product/stock/privateInventory/querySpuPage',
    querySkuDetailPage: '/product/stock/privateInventory/querySkuDetailPage',
    querySkuDetailListBySku: '/product/stock/privateInventory/querySkuDetailListBySku',
    querySkuListByProductId: '/product/stock/privateInventory/querySkuListByProductId',
  },

  // === Product Listed (受益国) ===
  productListed: {
    getReceiverCountryInfo: '/product/listed/getReceiverCountryInfo',
  },
} as const;

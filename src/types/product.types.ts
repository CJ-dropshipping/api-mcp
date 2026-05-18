/**
 * @fileoverview 商品域类型定义
 * 使用 namespace 组织 Request / Response（前端规范 Service 层）
 */

export declare namespace SearchProducts {
  interface Request {
    /** 搜索关键词 */
    keyword?: string;
    /** 分类ID */
    categoryId?: string;
    /** 最低价格 */
    minPrice?: number;
    /** 最高价格 */
    maxPrice?: number;
    /** 页码 */
    pageNum?: number;
    /** 每页条数 */
    pageSize?: number;
    /** 排序字段 */
    sortField?: string;
    /** 排序方式 asc/desc */
    sortType?: string;
  }

  interface ProductItem {
    pid: string;
    productName: string;
    productNameEn: string;
    productImage: string;
    sellPrice: number;
    categoryId: string;
    categoryName: string;
    productWeight: number;
    productUnit: string;
    createTime: string;
  }

  interface Response {
    list: ProductItem[];
    total: number;
    pageNum: number;
    pageSize: number;
  }
}

export declare namespace GetProductDetail {
  interface Request {
    /** 商品ID */
    pid?: string;
    /** 商品SKU */
    productSku?: string;
  }

  interface Variant {
    vid: string;
    variantName: string;
    variantNameEn: string;
    variantImage: string;
    variantSku: string;
    variantPrice: number;
    variantWeight: number;
    variantStock: number;
    variantProperty: string;
  }

  interface ProductDetail {
    pid: string;
    productName: string;
    productNameEn: string;
    productImage: string;
    productImages: string[];
    description: string;
    descriptionEn: string;
    sellPrice: number;
    categoryId: string;
    categoryName: string;
    productWeight: number;
    productUnit: string;
    variants: Variant[];
    createTime: string;
    sourceFrom: number;
  }

  type Response = ProductDetail;
}

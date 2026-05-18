/**
 * @fileoverview 仓库域类型定义
 */

export declare namespace GetWarehouseList {
  interface Request {
    /** 区域ID */
    areaId?: string;
  }

  interface WarehouseItem {
    storehouseId: string;
    storehouseName: string;
    storehouseNameEn: string;
    countryCode: string;
    countryName: string;
    areaId: string;
    areaName: string;
    serviceType: string;
  }

  type Response = WarehouseItem[];
}

export declare namespace GetWarehouseCost {
  interface Request {
    /** 仓库ID */
    storehouseId: string;
    /** 商品SKU */
    productSku?: string;
  }

  interface CostItem {
    costType: string;
    costName: string;
    costNameEn: string;
    price: number;
    unit: string;
    description: string;
  }

  type Response = CostItem[];
}

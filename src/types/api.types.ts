/**
 * @fileoverview CJ API 统一响应类型定义
 */

/** CJ API 统一响应结构 */
export interface CjApiResponse<T = any> {
  code: number;
  result: boolean;
  data: T;
  message: string;
}

/** 分页请求参数 */
export interface PaginationParams {
  pageNum: number;
  pageSize: number;
}

/** 分页响应数据 */
export interface PaginationData<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

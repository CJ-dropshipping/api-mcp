/**
 * @fileoverview 商品查询 MCP Tools
 * - search_products: 搜索商品 (对应 /product/listV2 或 /product/query)
 * - get_category_tree: 获取分类树 (对应 /category/getCategoryTree)
 * - get_warehouses: 获取全球仓库列表 (对应 /product/globalWarehouseList)
 *
 * 描述参考 mycj-react 中商品搜索、分类筛选、仓库选择的业务场景
 *
 * @note 纠正(73次): search_products 返回结果中的每个商品项注入 productUrl 字段，
 * 使用 getProductUrl 工具函数生成与前端一致的商品详情页链接格式：
 * /product/${urlQueryFormat(name)}-p-${id}.html
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient, AuthExpiredError, isApiSuccess } from '../../api-client/http-client.js';
import { ENDPOINTS } from '../../api-client/endpoints.js';
import { ensureAccessToken, getAccessToken } from '../../auth/session.js';
import { setTokenGetter } from '../../api-client/http-client.js';
import { getEnvConfig } from '../../config/env.js';
import { getProductUrl } from '../../utils/product-href.js';

// 注入 token getter (同步获取缓存的 token)
setTokenGetter(() => getAccessToken());

export const productTools: Tool[] = [
  {
    name: 'search_products',
    description:
      '搜索CJ商品，支持关键词、分类、价格范围筛选。适用于选品、找货、商品对比场景。\n' +
      '【参数映射规则】\n' +
      '- 用户说「找手机壳」「搜鼠标」「有没有XX商品」→ keyword=对应关键词（支持中英文）\n' +
      '- 用户说「50美元以内的XX」→ keyword=XX, maxPrice=50\n' +
      '- 用户说「便宜的XX」「价格低的」→ minPrice/maxPrice 合理设置\n' +
      '- 用户说「给我看更多」「下一页」→ pageNum 递增\n' +
      'Search CJ products by keyword, category, price range. Used for product sourcing, comparison, and discovery.\n' +
      '[Intent mapping] user says "find phone case" → keyword="phone case"; "搜鼠标" → keyword="鼠标"; "under $50" → maxPrice=50; "show more" → pageNum++',
    inputSchema: {
      type: 'object' as const,
      properties: {
        keyword: {
          type: 'string',
          description: '搜索关键词（商品名/SKU/描述）/ Search keyword (product name/SKU/description)',
        },
        categoryId: {
          type: 'string',
          description: '分类ID，可通过 get_category_tree 获取 / Category ID from get_category_tree',
        },
        minPrice: {
          type: 'number',
          description: '最低价格(USD) / Minimum price in USD',
        },
        maxPrice: {
          type: 'number',
          description: '最高价格(USD) / Maximum price in USD',
        },
        pageNum: {
          type: 'number',
          description: '页码，默认1 / Page number, default 1',
        },
        pageSize: {
          type: 'number',
          description: '每页数量，默认20，最大50 / Page size, default 20, max 50',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_category_tree',
    description:
      '获取CJ商品分类树，用于筛选搜索范围。一级分类如服装、电子、家居等 / ' +
      'Get CJ product category tree for filtering. Top categories: Clothing, Electronics, Home, etc.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        parentId: {
          type: 'string',
          description: '父分类ID，不传返回顶级分类 / Parent category ID, omit for top-level categories',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_warehouses',
    description:
      '获取CJ全球仓库列表，包含仓库名称、国家、编码。用于查看发货仓位置、库存分布 / ' +
      'Get CJ global warehouse list with name, country, code. Used for checking shipping origins and stock distribution.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

export async function handleProductTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  // 检查登录态
  const token = await ensureAccessToken();
  if (!token) {
    return {
      content: [{
        type: 'text',
        text: '❌ 未登录或登录已过期，请先调用 show_login_form 登录 / Not logged in or session expired. Please call show_login_form first.',
      }],
      isError: true,
    };
  }

  try {
    switch (name) {
      case 'search_products':
        return await handleSearchProducts(args);
      case 'get_category_tree':
        return await handleGetCategoryTree(args);
      case 'get_warehouses':
        return await handleGetWarehouses();
      default:
        return { content: [{ type: 'text', text: `Unknown product tool: ${name}` }], isError: true };
    }
  } catch (error: unknown) {
    if (error instanceof AuthExpiredError) {
      return {
        content: [{ type: 'text', text: error.message }],
        isError: true,
      };
    }
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
  }
}

async function handleSearchProducts(args: Record<string, unknown>) {
  /**
   * @note 纠正: product/listV2 是 GET 接口，参数通过 query string 传递
   * 原实现用 POST + body 导致 "Request method 'POST' not supported"
   * @note 纠正(77次): 搜索关键词参数应使用 keyWord（支持中英文），而非 productNameEn（仅英文）。
   * 修复前使用 productNameEn 导致中文搜索结果不准确。
   */
  const params: Record<string, string> = {};
  if (args.keyword) params.keyWord = String(args.keyword);
  if (args.categoryId) params.categoryId = String(args.categoryId);
  if (args.minPrice != null) params.minPrice = String(args.minPrice);
  if (args.maxPrice != null) params.maxPrice = String(args.maxPrice);
  params.pageNum = String((args.pageNum as number) || 1);
  params.pageSize = String(Math.min((args.pageSize as number) || 20, 50));

  const response = await httpClient.request(ENDPOINTS.product.listV2, {
    method: 'GET',
    params,
    tier: 'read',
  });

  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `搜索失败 / Search failed: ${response.message}` }], isError: true };
  }

  /**
   * @note 纠正(73次): 为每个商品注入 productUrl 字段，格式与前端 getProductHref 一致。
   * @note 纠正(75次): API 响应结构为 data.content[].productList[]，字段为 id/nameEn，
   *   而非原先假设的 data.list[]（pid/productNameEn）。修复遍历路径和字段名。
   * 业务影响：AI 返回商品搜索结果时，用户可直接点击链接访问对应商品页面。
   */
  const config = getEnvConfig();
  type ProductItem = Record<string, unknown>;
  type ContentItem = { productList?: ProductItem[]; [key: string]: unknown };
  const data = response.data as { content?: ContentItem[]; [key: string]: unknown } | null;
  if (data && Array.isArray(data.content)) {
    data.content = data.content.map((contentItem: ContentItem) => {
      if (!Array.isArray(contentItem.productList)) return contentItem;
      return {
        ...contentItem,
        productList: contentItem.productList.map((item: ProductItem) => ({
          ...item,
          productUrl: getProductUrl(
            config.webBase,
            String(item.id || ''),
            String(item.nameEn || '')
          ),
        })),
      };
    });
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
  };
}

async function handleGetCategoryTree(args: Record<string, unknown>) {
  /**
   * @note 纠正: category/getCategoryTree 是 GET 接口
   */
  const params: Record<string, string> = {};
  if (args.parentId) params.parentId = String(args.parentId);

  const response = await httpClient.request(ENDPOINTS.category.getCategoryTree, {
    method: 'GET',
    params,
    tier: 'read',
  });

  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `获取分类失败 / Get categories failed: ${response.message}` }], isError: true };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
  };
}

async function handleGetWarehouses() {
  const response = await httpClient.request(ENDPOINTS.product.globalWarehouseList, {
    method: 'GET',
    tier: 'read',
  });

  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `获取仓库失败 / Get warehouses failed: ${response.message}` }], isError: true };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
  };
}

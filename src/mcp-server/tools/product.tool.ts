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
      '搜索CJ平台商品，支持关键词、分类、价格、国家、仓库类型等多维度筛选。\n' +
      '【意图映射规则】\n' +
      '- 用户说「全球仓商品」「美国仓商品」「美国仓」「US仓」→ isWarehouse=true, countryCode=US\n' +
      '- 用户说「中国仓商品」「CN仓商品」→ isWarehouse=true, countryCode=CN\n' +
      '- 用户说「全球仓」不指定国家 → isWarehouse=true\n' +
      '- 用户说「找手机壳」「搜鼠标」「有没有XX商品」→ keyword=对应关键词（支持中英文）\n' +
      '- 用户说「50美元以内的XX」→ keyword=XX, maxPrice=50\n' +
      '- 用户说「免费配送」「包邮」→ addMarkStatus=1\n' +
      '- 用户说「按价格从低到高」→ orderBy=2, sort=asc\n' +
      '- 用户说「给我看更多」「下一页」→ pageNum 递增\n' +
      '- 用户说「我自己的备货」「我的私有库存」「我入库的商品」→ 使用 query_private_inventory\n' +
      'Search CJ products with keyword, category, price, country, warehouse type filters.\n' +
      '[Intent mapping] "US warehouse" → isWarehouse=true, countryCode=US; "global warehouse" → isWarehouse=true;\n' +
      '"my own stock/private inventory" → use query_private_inventory instead.',
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
        countryCode: {
          type: 'string',
          description:
            '国家代码，用于过滤指定国家有库存的商品，如 US/CN/GB/DE/FR 等。\n' +
            '例：美国仓 → countryCode=US；中国仓 → countryCode=CN / ' +
            'Country code to filter products with inventory in that country. e.g. US, CN, GB. US warehouse → US.',
        },
        isWarehouse: {
          type: 'boolean',
          description:
            '是否查询全球仓商品。true=只查全球仓商品，false/不传=全部商品 / ' +
            'Filter global warehouse products. true=global warehouse only. Use with countryCode for specific country.',
        },
        minPrice: {
          type: 'number',
          description: '最低价格(USD) / Minimum price in USD',
        },
        maxPrice: {
          type: 'number',
          description: '最高价格(USD) / Maximum price in USD',
        },
        addMarkStatus: {
          type: 'number',
          description: '包邮筛选：0-不包邮，1-包邮 / Free shipping filter: 0-not free, 1-free shipping',
        },
        productType: {
          type: 'number',
          description: '商品类型：4-供应商商品，10-视频商品，11-非视频商品 / Product type: 4-Supplier, 10-Video, 11-Non-video',
        },
        productFlag: {
          type: 'number',
          description: '商品标签：0-热卖，1-新品，2-视频，3-滞销 / Product flag: 0-Trending, 1-New, 2-Video, 3-Slow-moving',
        },
        sort: {
          type: 'string',
          description: '排序方向：desc-降序（默认），asc-升序 / Sort direction: desc(default), asc',
        },
        orderBy: {
          type: 'number',
          description: '排序字段：0-最佳匹配（默认），1-刊登数，2-价格，3-创建时间，4-库存 / Sort field: 0-Best match, 1-Listed count, 2-Price, 3-Create time, 4-Inventory',
        },
        pageNum: {
          type: 'number',
          description: '页码，默认1 / Page number, default 1',
        },
        pageSize: {
          type: 'number',
          description: '每页数量，默认20，最大100 / Page size, default 20, max 100',
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
      '获取CJ全球仓库列表，包含仓库名称、国家、仓库ID(warehouseId)。\n' +
      '【用法】查询私有库存时，先调用此工具获取仓库列表，再将目标仓库的 warehouseId 传给 query_private_inventory 进行过滤。\n' +
      '- 用户说「美国仓」「US仓」→ 找到 country=US 的仓库，取其 warehouseId\n' +
      '- 用户说「中国仓」「CN仓」→ 找到 country=CN 的仓库，取其 warehouseId\n' +
      'Get CJ global warehouse list with name, country, warehouseId.\n' +
      '[Usage] To filter private inventory by warehouse: call this first to get warehouseId, then pass to query_private_inventory.',
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
   * @note 纠正(9次): 新增 countryCode/isWarehouse/addMarkStatus/productType/productFlag/sort/orderBy 参数，
   * 支持全球仓（isWarehouse=true）、国家过滤（countryCode=US）等场景；页面大小上限提升至100。
   */
  const params: Record<string, string> = {};
  if (args.keyword) params.keyWord = String(args.keyword);
  if (args.categoryId) params.categoryId = String(args.categoryId);
  if (args.countryCode) params.countryCode = String(args.countryCode);
  if (args.isWarehouse != null) params.isWarehouse = String(args.isWarehouse);
  if (args.minPrice != null) params.startSellPrice = String(args.minPrice);
  if (args.maxPrice != null) params.endSellPrice = String(args.maxPrice);
  if (args.addMarkStatus != null) params.addMarkStatus = String(args.addMarkStatus);
  if (args.productType != null) params.productType = String(args.productType);
  if (args.productFlag != null) params.productFlag = String(args.productFlag);
  if (args.sort) params.sort = String(args.sort);
  if (args.orderBy != null) params.orderBy = String(args.orderBy);
  params.pageNum = String((args.pageNum as number) || 1);
  params.pageSize = String(Math.min((args.pageSize as number) || 20, 100));

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

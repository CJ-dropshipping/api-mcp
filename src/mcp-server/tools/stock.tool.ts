/**
 * @fileoverview 库存管理 MCP Tools
 * 对应 OpenAPI Stock/Warehouse 域端点
 * 描述参考 mycj-react 中私有库存查询、仓库管理的业务场景
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient, AuthExpiredError, isApiSuccess } from '../../api-client/http-client.js';
import { ENDPOINTS } from '../../api-client/endpoints.js';
import { ensureAccessToken } from '../../auth/session.js';
import { getProductUrl } from '../../utils/product-href.js';
import { getEnvConfig } from '../../config/env.js';

export const stockTools: Tool[] = [
  {
    name: 'query_private_inventory',
    description:
      '查询您自己采购并存放在CJ仓库中的私有备货商品（SPU列表）。仅返回您账户下的私有库存，不是CJ平台公开商品。\n' +
      '⚠️【重要区分】\n' +
      '  - "全球仓商品"/"美国仓商品"（CJ平台全球仓可购商品）→ 使用 search_products（isWarehouse=true + countryCode=US）\n' +
      '  - "我自己的备货"/"我购入的商品"/"私有库存"/"我自己入库的" → 使用此工具\n' +
      '【意图映射】\n' +
      '- 用户说「我的备货」「私有库存」「我自己购入的商品」「查我的库存」→ 使用此工具\n' +
      '- 用户说「哪个仓库」→ 先调用 get_warehouses 获取仓库列表，再传 warehouseId 筛选\n' +
      'Query YOUR OWN stocked products (private inventory) you purchased and stored in CJ warehouses.\n' +
      '[IMPORTANT] "global warehouse products" / "US warehouse products from CJ catalog" → use search_products(isWarehouse=true, countryCode=US)\n' +
      '"My own inventory / My stocked products / Private inventory" → use this tool.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pageNum: { type: 'number', description: '页码，默认1 / Page number, default 1' },
        pageSize: { type: 'number', description: '每页数量，默认20，最大200 / Page size, default 20, max 200' },
        keyword: { type: 'string', description: '搜索关键词（商品名/SKU）/ Search keyword (product name/SKU)' },
        warehouseId: {
          type: 'string',
          description:
            '仓库ID，从 get_warehouses 返回结果中获取，用于过滤特定仓库的商品。\n' +
            '例：用户说「美国仓」→ 先 get_warehouses 找 country=US 的仓库，取 warehouseId / ' +
            'Warehouse ID from get_warehouses. Use to filter by specific warehouse (e.g. US warehouse → country=US).',
        },
      },
      required: [],
    },
  },
  {
    name: 'query_sku_details',
    description:
      '查询私有库存SKU明细，查看某个商品的各变体库存数量和仓库分布 / ' +
      'Query private inventory SKU details. View variant stock quantities and warehouse distribution for a product.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        productId: { type: 'string', description: '商品ID / Product ID' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'query_sku_detail_page',
    description:
      '分页查询SKU明细列表，适用于大量SKU的商品 / ' +
      'Paginated SKU detail list query. Suitable for products with many SKUs.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pageNum: { type: 'number', description: '页码 / Page number' },
        pageSize: { type: 'number', description: '每页数量 / Page size' },
        keyword: { type: 'string', description: '搜索关键词 / Search keyword' },
      },
      required: [],
    },
  },
];

export async function handleStockTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
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
      case 'query_private_inventory': {
        /**
         * @note 纠正(9次): 新增 warehouseId 参数支持仓库过滤，提升页面大小上限至200，并注入 productUrl
         */
        const requestBody: Record<string, unknown> = {
          pageNum: (args.pageNum as number) || 1,
          pageSize: Math.min((args.pageSize as number) || 20, 200),
          keyword: args.keyword,
        };
        if (args.warehouseId) requestBody.warehouseId = String(args.warehouseId);

        const response = await httpClient.request(ENDPOINTS.stock.querySpuPage, {
          body: requestBody,
          tier: 'read',
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: 'text', text: `查询库存失败 / Query inventory failed: ${response.message}` }], isError: true };
        }

        // 注入 productUrl 字段，方便 AI 直接给用户返回可点击链接
        const config = getEnvConfig();
        type SpuItem = Record<string, unknown>;
        const data = response.data as { list?: SpuItem[]; records?: SpuItem[]; [key: string]: unknown } | null;
        if (data) {
          const list = Array.isArray(data.list) ? data.list : Array.isArray(data.records) ? data.records : null;
          if (list) {
            const listKey = Array.isArray(data.list) ? 'list' : 'records';
            (data as Record<string, unknown>)[listKey] = list.map((item: SpuItem) => {
              const pid = String(item.pid || item.productId || '');
              const name = String(item.productNameEn || item.productName || '');
              return pid ? { ...item, productUrl: getProductUrl(config.webBase, pid, name) } : item;
            });
          }
        }

        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'query_sku_details': {
        const response = await httpClient.request(ENDPOINTS.stock.querySkuListByProductId, {
          body: { productId: args.productId },
          tier: 'read',
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: 'text', text: `查询SKU失败 / Query SKU failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'query_sku_detail_page': {
        const response = await httpClient.request(ENDPOINTS.stock.querySkuDetailPage, {
          body: {
            pageNum: (args.pageNum as number) || 1,
            pageSize: Math.min((args.pageSize as number) || 20, 50),
            keyword: args.keyword,
          },
          tier: 'read',
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: 'text', text: `查询SKU明细失败 / Query SKU details failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown stock tool: ${name}` }], isError: true };
    }
  } catch (error: unknown) {
    if (error instanceof AuthExpiredError) {
      return { content: [{ type: 'text', text: error.message }], isError: true };
    }
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
  }
}

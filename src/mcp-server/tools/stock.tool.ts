/**
 * @fileoverview 库存管理 MCP Tools
 * 对应 OpenAPI Stock/Warehouse 域端点
 * 描述参考 mycj-react 中私有库存查询、仓库管理的业务场景
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient, AuthExpiredError, isApiSuccess } from '../../api-client/http-client.js';
import { ENDPOINTS } from '../../api-client/endpoints.js';
import { ensureAccessToken } from '../../auth/session.js';

export const stockTools: Tool[] = [
  {
    name: 'query_private_inventory',
    description:
      '查询私有库存SPU列表，查看您在CJ仓库中的备货商品 / ' +
      'Query private inventory SPU list. View your stocked products in CJ warehouses.',
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
        const response = await httpClient.request(ENDPOINTS.stock.querySpuPage, {
          body: {
            pageNum: (args.pageNum as number) || 1,
            pageSize: Math.min((args.pageSize as number) || 20, 50),
            keyword: args.keyword,
          },
          tier: 'read',
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: 'text', text: `查询库存失败 / Query inventory failed: ${response.message}` }], isError: true };
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

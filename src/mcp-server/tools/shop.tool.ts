/**
 * @fileoverview 店铺管理 MCP Tools
 * 对应 OpenAPI Shop + Authentication 域端点
 * 描述参考 mycj-react 中店铺授权、店铺列表的业务场景
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient, AuthExpiredError, isApiSuccess } from '../../api-client/http-client.js';
import { ENDPOINTS } from '../../api-client/endpoints.js';
import { ensureAccessToken } from '../../auth/session.js';

export const shopTools: Tool[] = [
  {
    name: 'list_shops',
    description:
      '获取已授权店铺列表，包含Shopify/WooCommerce/eBay等平台的店铺信息 / ' +
      'Get authorized shop list including Shopify/WooCommerce/eBay platform stores.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pageNum: { type: 'number', description: '页码 / Page number' },
        pageSize: { type: 'number', description: '每页数量 / Page size' },
      },
      required: [],
    },
  },
  {
    name: 'get_authorize_url',
    description:
      '获取店铺授权链接，用于连接新的电商平台店铺到CJ账户 / ' +
      'Get shop authorization URL for connecting a new e-commerce platform store to CJ account.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        shopType: {
          type: 'string',
          description: '平台类型(shopify/woocommerce/ebay等) / Platform type',
        },
      },
      required: ['shopType'],
    },
  },
];

export async function handleShopTool(
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
      case 'list_shops': {
        /**
         * @note 纠正: shop/getShops 是 GET 接口
         */
        const response = await httpClient.request(ENDPOINTS.shop.getShops, {
          method: 'GET',
          params: {
            pageNum: String((args.pageNum as number) || 1),
            pageSize: String(Math.min((args.pageSize as number) || 20, 50)),
          },
          tier: 'read',
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: 'text', text: `获取店铺列表失败 / Get shops failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_authorize_url': {
        /**
         * @note 纠正: getAuthorizeUrl 是 GET 接口
         */
        const response = await httpClient.request(ENDPOINTS.auth.getAuthorizeUrl, {
          method: 'GET',
          params: { shopType: String(args.shopType) },
          tier: 'read',
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: 'text', text: `获取授权链接失败 / Get auth URL failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown shop tool: ${name}` }], isError: true };
    }
  } catch (error: unknown) {
    if (error instanceof AuthExpiredError) {
      return { content: [{ type: 'text', text: error.message }], isError: true };
    }
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
  }
}

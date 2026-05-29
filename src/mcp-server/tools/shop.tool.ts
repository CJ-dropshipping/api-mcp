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
        keyword: {
          type: 'string',
          description: '搜索关键词，按店铺名称过滤 / Search keyword to filter shops by name',
        },
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
  {
    name: 'get_account_settings',
    description:
      '获取CJ账户设置信息，包含账户名称、邮筱、API配额限制、QPS限制、Webhook回调配置等。\n' +
      '触发场景：「我的账户设置」「我的账号信息」「API配额还剩多少」「我的QPS限制是多少」「my account settings」。' +
      'Returns: openId, openName, openEmail, quotaLimits, qpsLimit, webhook callback config, etc.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'save_product_to_shop',
    description: [
      '将店铺商品信息保存/同步到CJ系统中，建立商品与CJ的关联。',
      '⚠️【敏感操作 - 需用户确认】此操作将修改CJ系统中的店铺商品数据。',
      '触发场景：「保存商品到CJ」「同步商品到店铺」「save product to CJ」。',
      '必填参数：id（店铺商品ID）、title（商品标题）、image（商品图片URL）。',
      '选填参数：description（描述）、priceMin/priceMax/priceCurrency（价格区间和货币，需同时提供三者）。',
    ].join(' '),
    inputSchema: {
      type: 'object' as const,
      properties: {
        id: { type: 'string', description: '店铺商品ID（必填，最长64位）/ Store product ID (required)' },
        title: { type: 'string', description: '商品标题（必填，最长500位）/ Product title (required)' },
        image: { type: 'string', description: '商品图片URL（必填，最长400位）/ Product image URL (required)' },
        description: { type: 'string', description: '商品描述（可选，最长5000位）/ Product description (optional)' },
        priceMin: { type: 'number', description: '最低价格（可选，需与priceCurrency同时提供）/ Min price' },
        priceMax: { type: 'number', description: '最高价格（可选，需与priceCurrency同时提供）/ Max price' },
        priceCurrency: { type: 'string', description: '价格货币代码如USD（可选）/ Price currency e.g. USD' },
      },
      required: ['id', 'title', 'image'],
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
        const params: Record<string, string> = {
          pageNum: String((args.pageNum as number) || 1),
          pageSize: String(Math.min((args.pageSize as number) || 20, 50)),
        };
        if (args.keyword) params.keyword = String(args.keyword);
        const response = await httpClient.request(ENDPOINTS.shop.getShops, {
          method: 'GET',
          params,
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

      case 'get_account_settings': {
        /**
         * @note 纠正(13次): 新增 get_account_settings 工具，对应 GET /setting/get。
         * 返回账户信息：openId/openName/openEmail、API配额限制、QPS、Webhook配置等。
         * 只读操作。
         */
        const settingResp = await httpClient.request(ENDPOINTS.setting.get, {
          method: 'GET',
          tier: 'read',
        });
        if (!isApiSuccess(settingResp)) {
          return { content: [{ type: 'text', text: `获取账户设置失败 / Get settings failed: ${settingResp.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(settingResp.data, null, 2) }] };
      }

      case 'save_product_to_shop': {
        /**
         * @note 新增(第14次): save_product_to_shop，POST /store/product/saveProduct。
         * 将店铺商品信息保存/同步到CJ系统，建立商品关联。
         * ⚠️ 敏感操作：修改CJ系统中的店铺商品数据。
         */
        if (!args.id || !args.title || !args.image) {
          return {
            content: [{ type: 'text', text: '❌ 请提供 id、title 和 image / Please provide id, title and image.' }],
            isError: true,
          };
        }
        const body: Record<string, unknown> = {
          id: String(args.id),
          title: String(args.title),
          image: String(args.image),
        };
        if (args.description) body.description = String(args.description);
        if (args.priceMin !== undefined) body.priceMin = Number(args.priceMin);
        if (args.priceMax !== undefined) body.priceMax = Number(args.priceMax);
        if (args.priceCurrency) body.priceCurrency = String(args.priceCurrency);

        const saveResp = await httpClient.request(ENDPOINTS.store.saveProduct, {
          body,
          tier: 'write',
        });
        if (!isApiSuccess(saveResp)) {
          return { content: [{ type: 'text', text: `保存商品失败 / Save product failed: ${saveResp.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: `✅ 商品已保存到CJ店铺系统 / Product saved to CJ store system.\n${JSON.stringify(saveResp.data, null, 2)}` }] };
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

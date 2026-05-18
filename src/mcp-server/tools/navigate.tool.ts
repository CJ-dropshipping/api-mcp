/**
 * @fileoverview 导航链接 MCP Tools
 * 对于复杂交互（下单、刊登、商品关联店铺），生成浏览器可打开的URL
 * 测试环境: http://www.cjdropshipping.offline.pre.com
 * 线上环境: https://www.cjdropshipping.com
 *
 * @note 纠正(73次): open_order_page 生成的商品详情页链接改用 getProductUrl 格式，
 * 与前端 getProductHref 保持一致：/product/${urlQueryFormat(name)}-p-${id}.html
 * 同时新增可选参数 productName，用于生成更友好的 SEO 链接。
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getEnvConfig } from '../../config/env.js';
import { getProductUrl } from '../../utils/product-href.js';

export const navigateTools: Tool[] = [
  {
    name: 'open_order_page',
    description:
      '生成下单页面链接，用于在浏览器中完成复杂的下单流程（选择变体、填写地址、确认支付）/ ' +
      'Generate order page URL for completing complex order flow in browser (select variants, fill address, confirm payment).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        productId: {
          type: 'string',
          description: '商品ID / Product ID',
        },
        productName: {
          type: 'string',
          description: '商品英文名（可选，用于生成 SEO 友好链接）/ Product English name (optional, for SEO-friendly URL)',
        },
        variantId: {
          type: 'string',
          description: '变体ID(可选) / Variant ID (optional)',
        },
      },
      required: ['productId'],
    },
  },
  {
    name: 'open_listing_page',
    /**
     * @note 纠正(75次): 改为生成商品详情页 + ?list=1 参数，与前端 use-eidt-list.ts useEffect
     * 自动触发刊登弹窗的逻辑对齐。原格式 /myCJ.html#/listing 跳转到后台列表页，不触发刊登弹窗。
     */
    description:
      '\u6253\u5f00\u5546\u54c1\u8be6\u60c5\u9875\u5e76\u81ea\u52a8\u5f39\u51fa\u520a\u767b\u5f39\u7a97\uff08\u901a\u8fc7 ?list=1 URL \u53c2\u6570\u89e6\u53d1\uff09\u3002\u300a\u5fc5\u8bfb\u300b productId \u5fc5\u987b\u53d6\u81ea search_products \u6216 query_sku_details \u7684\u8fd4\u56de\u7ed3\u679c\uff0c\u4e0d\u5f97\u81ea\u884c\u62fc\u51d1 / ' +
      'Open product detail page with listing modal auto-triggered via ?list=1 URL param. REQUIRED: productId MUST come from search_products or query_sku_details result.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        productId: {
          type: 'string',
          description: '\u5546\u54c1ID\uff08\u5fc5\u987b\u53d6\u81ea search_products \u6216 query_sku_details \u7684\u8fd4\u56de\u7ed3\u679c\uff09/ Product ID (MUST come from search_products or query_sku_details result)',
        },
        productName: {
          type: 'string',
          description: '\u5546\u54c1\u82f1\u6587\u540d\uff08\u5efa\u8bae\u4f20\u5165\u4ee5\u751f\u6210 SEO \u53cb\u597d\u94fe\u63a5\uff09/ Product English name (recommended to pass for SEO-friendly URL)',
        },
      },
      required: ['productId'],
    },
  },
  {
    name: 'open_product_connect_page',
    /**
     * @note 纠正(75次): 改为生成商品详情页 + ?connect=1 参数，与前端 use-connect.ts 新增的
     * useEffect 检测逻辑对齐。原格式 /myCJ.html#/productConnect 没有商品上下文（无 productId/sku）。
     * @note 纠正(76次): 完善描述，明确指引 AI 必须从商品搜索结果中取 productId，
     * 避免 AI 未传 productId 导致 URL 中缺少商品 ID 和名称。
     */
    description:
      '\u6253\u5f00\u5546\u54c1\u8be6\u60c5\u9875\u5e76\u81ea\u52a8\u89e6\u53d1\u8fde\u63a5\uff08\u5173\u8054\u5e97\u94fa\uff09\u6d41\u7a0b\uff08\u901a\u8fc7 ?connect=1 URL \u53c2\u6570\u89e6\u53d1\uff09\u3002\u300a\u5fc5\u8bfb\u300b productId \u5fc5\u987b\u53d6\u81ea search_products \u6216 query_sku_details \u7684\u8fd4\u56de\u7ed3\u679c\uff0c\u4e0d\u5f97\u81ea\u884c\u62fc\u51d1\u3002\u82e5\u5c1a\u672a\u641c\u7d22\u5546\u54c1\uff0c\u8bf7\u5148\u8c03\u7528 search_products \u83b7\u53d6 productId \u4e0e productName \u540e\u518d\u8c03\u7528\u672c\u5de5\u5177 / ' +
      'Open product detail page with connect flow auto-triggered via ?connect=1 URL param. REQUIRED: productId MUST come from search_products or query_sku_details. If no product found yet, call search_products first to get productId and productName.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        productId: {
          type: 'string',
          description: '\u5546\u54c1ID\uff08\u5fc5\u987b\u53d6\u81ea search_products \u6216 query_sku_details \u7684\u8fd4\u56de\u7ed3\u679c\uff0c\u4e0d\u5f97\u7559\u7a7a\u6216\u4f20 undefined\uff09/ Product ID (MUST come from search_products or query_sku_details, must not be empty or undefined)',
        },
        productName: {
          type: 'string',
          description: '\u5546\u54c1\u82f1\u6587\u540d\uff08\u5efa\u8bae\u4f20\u5165\u4ee5\u751f\u6210 SEO \u53cb\u597d\u94fe\u63a5\uff09/ Product English name (recommended to pass for SEO-friendly URL)',
        },
      },
      required: ['productId'],
    },
  },
  {
    name: 'open_shopping_cart',
    description:
      '生成购物车页面链接，查看和管理购物车中的商品 / ' +
      'Generate shopping cart page URL to view and manage cart items in browser.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

export async function handleNavigateTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const config = getEnvConfig();
  const baseUrl = config.webBase;

  switch (name) {
    case 'open_order_page': {
      const productId = args.productId as string;
      const productName = args.productName as string | undefined;
      const variantId = args.variantId as string | undefined;
      /**
       * @note 纠正(73次): 改用 getProductUrl 生成商品详情页链接，格式与前端一致。
       * 原格式：/product/detail/${productId}（非标准，不被搜索引擎收录）
       * 新格式：/product/${urlQueryFormat(name)}-p-${id}.html（SEO 友好，与前端一致）
       * 若未提供 productName，URL 退化为 /product/-p-${id}.html，仍可正常访问。
       */
      let url = getProductUrl(baseUrl, productId, productName || '');
      if (variantId) url += `?vid=${variantId}`;
      return {
        content: [{
          type: 'text',
          text: `🔗 下单页面 / Order Page:\n${url}\n\n请在浏览器中打开此链接完成下单 / Please open this URL in browser to complete the order.`,
        }],
      };
    }

    case 'open_listing_page': {
      const productId = args.productId as string;
      const productName = args.productName as string | undefined;
      /**
       * @note 纠正(75次): 改用 getProductUrl 生成商品详情页链接并附加 ?list=1，
       * 前端 use-eidt-list.ts 的 useEffect 检测到 ?list=1 后自动调用 openListModal()。
       * 原格式 /myCJ.html#/listing?pid=${productId} 跳转到后台列表页，无法触发刊登弹窗。
       */
      const url = `${getProductUrl(baseUrl, productId, productName || '')}?list=1`;
      return {
        content: [{
          type: 'text',
          text: `🏪 刊登页面 / Listing Page:\n${url}\n\n请在浏览器中打开此链接，页面将自动弹出刊登弹窗 / Open this URL in browser, the listing modal will open automatically.`,
        }],
      };
    }

    case 'open_product_connect_page': {
      const productId = args.productId as string;
      const productName = args.productName as string | undefined;
      /**
       * @note 纠正(75次): 改用 getProductUrl 生成商品详情页链接并附加 ?connect=1，
       * 前端 use-connect.ts 新增的 useEffect 检测到 ?connect=1 后自动调用 goConnection()。
       * 原格式 /myCJ.html#/productConnect 无商品上下文（无 sku），无法完成关联流程。
       * @note 纠正(76次): 新增防御性检查，若 productId 为空则返回可操作错误提示，
       * 引导 AI 先调用 search_products 获取商品信息。
       */
      if (!productId) {
        return {
          content: [{
            type: 'text',
            text: '\u274c 缺少必要参数 productId！\u8bf7先调用 search_products 搜索商品，将返回结果中的 productId 和 productNameEn 传入本工具。\n Missing required param: productId. Please call search_products first and use the returned productId and productNameEn.',
          }],
          isError: true,
        };
      }
      const url = `${getProductUrl(baseUrl, productId, productName || '')}?connect=1`;
      return {
        content: [{
          type: 'text',
          text: `🔗 商品连接页面 / Product Connect Page:\n${url}\n\n请在浏览器中打开此链接，页面将自动触发商品连接流程 / Open this URL in browser, the product connect flow will start automatically.`,
        }],
      };
    }

    case 'open_shopping_cart': {
      const url = `${baseUrl}/myCJ.html#/shoppingCart`;
      return {
        content: [{
          type: 'text',
          text: `🔗 购物车 / Shopping Cart:\n${url}\n\n请在浏览器中打开此链接管理购物车 / Please open this URL in browser to manage your cart.`,
        }],
      };
    }

    default:
      return { content: [{ type: 'text', text: `Unknown navigate tool: ${name}` }], isError: true };
  }
}

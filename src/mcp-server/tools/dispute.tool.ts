/**
 * @fileoverview 纠纷管理 MCP Tools
 * 对应 OpenAPI Disputes 域端点
 * 描述参考 mycj-react 中纠纷发起、取消、查询的业务场景
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient, AuthExpiredError, isApiSuccess } from '../../api-client/http-client.js';
import { ENDPOINTS } from '../../api-client/endpoints.js';
import { ensureAccessToken } from '../../auth/session.js';

export const disputeTools: Tool[] = [
  {
    name: 'get_dispute_products',
    description:
      '【开纠纷第一步】查询订单中可以申请纠纷的商品列表，返回每个商品的 lineItemId、价格、数量等信息。\n' +
      '开纠纷前必须先调用此工具获取 lineItemId，再调用 confirm_dispute 获取可选的纠纷原因和退款类型。\n' +
      '[Step 1 of dispute creation] Get disputable products for an order. Returns lineItemId, price, quantity.\n' +
      'MUST call this first before confirm_dispute and create_dispute.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: { type: 'string', description: 'CJ 订单号（必填）/ CJ Order ID (required)' },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'confirm_dispute',
    description:
      '【开纠纷第二步】查询可用的纠纷原因列表（disputeReasonList）、期望结果类型（expectResultOptionList: 1=退款/Refund, 2=补发/Reissue）和最大退款金额，用于填写下一步 create_dispute 的参数。\n' +
      '⚠️ 这是一个查询操作，不会创建或修改任何数据。\n' +
      '[Step 2 of dispute creation] Get available dispute reasons, expect types and max refund amounts.\n' +
      'Returns: disputeReasonList (with disputeReasonId+reasonName), expectResultOptionList, maxAmount.\n' +
      'NOT the final confirm action — use create_dispute after this.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: { type: 'string', description: 'CJ 订单号（必填）/ CJ Order ID (required)' },
        productInfoList: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              lineItemId: { type: 'string', description: '行项目ID（从 get_dispute_products 获取）/ From get_dispute_products' },
              quantity: { type: 'number', description: '申请数量 / Quantity to dispute' },
              price: { type: 'number', description: '商品单价 USD / Unit price in USD' },
            },
            required: ['lineItemId', 'quantity'],
          },
          description: '要申请纠纷的商品列表（从 get_dispute_products 获取 lineItemId）/ Products from get_dispute_products',
        },
      },
      required: ['orderId', 'productInfoList'],
    },
  },
  {
    name: 'create_dispute',
    description:
      '⚠️【敏感操作 - 发起纠纷，不可随意撤销】【开纠纷第三步】提交纠纷申请。\n' +
      '⚠️【调用前必须完成以下步骤，否则将无法成功】：\n' +
      '  1. 调用 get_dispute_products(orderId) → 获取商品 lineItemId、价格\n' +
      '  2. 调用 confirm_dispute(orderId, productInfoList) → 获取 disputeReasonId 列表和可选的 expectType\n' +
      '  3. 向用户展示可选的纠纷原因和期望结果，用户选择后再调用本工具\n' +
      '⚠️ [Step 3 of dispute creation] Submit dispute. MUST first call get_dispute_products → confirm_dispute → show options to user → call this.\n\n' +
      'expectType: 1=退款(Refund), 2=补发(Reissue)\n' +
      'refundType: 1=余额(balance), 2=平台原路退(platform)',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: {
          type: 'string',
          description: 'CJ 订单号（必填）/ CJ Order ID (required)',
        },
        disputeReasonId: {
          type: 'number',
          description: '纠纷原因ID（必填，整数，从 confirm_dispute 返回的 disputeReasonList 中选择）/ Dispute reason ID (integer, from confirm_dispute disputeReasonList)',
        },
        expectType: {
          type: 'number',
          description: '期望结果类型（必填）：1=退款(Refund) | 2=补发(Reissue)，从 confirm_dispute 返回的 expectResultOptionList 选择 / Expect type (required): 1=Refund, 2=Reissue',
        },
        refundType: {
          type: 'number',
          description: '退款方式：1=余额退款(balance) | 2=原路退款(platform)，默认1 / Refund type: 1=balance, 2=platform (default: 1)',
        },
        messageText: {
          type: 'string',
          description: '纠纷描述/说明（必填，最多500字符）/ Dispute description/message (required, max 500 chars)',
        },
        imageUrl: {
          type: 'array',
          items: { type: 'string' },
          description: '凭证图片URL列表（可选）/ Evidence image URLs (optional)',
        },
        productInfoList: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              lineItemId: { type: 'string', description: '行项目ID（从 get_dispute_products 获取）/ From get_dispute_products' },
              quantity: { type: 'number', description: '申请数量 / Dispute quantity' },
              price: { type: 'number', description: '商品单价 USD（从 get_dispute_products 获取）/ Unit price from get_dispute_products' },
            },
            required: ['lineItemId', 'quantity', 'price'],
          },
          description: '申请纠纷的商品列表（必填，含 lineItemId/quantity/price）/ Products list (required)',
        },
      },
      required: ['orderId', 'disputeReasonId', 'expectType', 'messageText', 'productInfoList'],
    },
  },
  {
    name: 'cancel_dispute',
    description:
      '⚠️【敏感操作 - 需用户确认】取消纠纷申请。在问题解决或协商一致后撤回纠纷 / ' +
      'Cancel a dispute request. Withdraw dispute after issue resolved or agreement reached.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: { type: 'string', description: 'CJ 订单号（必填）/ CJ Order ID (required)' },
        disputeId: { type: 'string', description: '纠纷ID（必填，从 list_disputes 或 get_dispute_detail 获取）/ Dispute ID (required, from list_disputes or get_dispute_detail)' },
      },
      required: ['orderId', 'disputeId'],
    },
  },
  {
    name: 'list_disputes',
    description:
      '查询纠纷列表，查看所有进行中和已结束的纠纷记录。\n' +
      '【意图映射】\n' +
      '- 用户说「我有哪些纠纷」「查下纠纷」→ 直接调用，不需要参数\n' +
      '- 用户说「还在处理中的纠纷」→ status="processing"\n' +
      '- 用户说「已解决的纠纷」「纠纷历史」→ status="finished"\n' +
      'List disputes. View all ongoing and resolved dispute records.\n' +
      '[Intent mapping] "my disputes" → no params; "pending disputes" → status="processing"; "resolved" → status="finished"',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pageNum: { type: 'number', description: '页码 / Page number' },
        pageSize: { type: 'number', description: '每页数量 / Page size' },
        status: { type: 'string', description: '状态筛选(processing/finished) / Status filter' },
      },
      required: [],
    },
  },
  {
    name: 'get_dispute_detail',
    description:
      '获取纠纷详情，包含纠纷状态、退款金额、商品信息等 / ' +
      'Get dispute detail including status, refund amount, and product list.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        disputeId: { type: 'string', description: '纠纷ID（必填，从 list_disputes 获取）/ Dispute ID (required, from list_disputes result)' },
      },
      required: ['disputeId'],
    },
  },
];

export async function handleDisputeTool(
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
      case 'get_dispute_products': {
        /**
         * @note 第24次提交: 新增 get_dispute_products，开纠纷第一步。
         * GET /disputes/disputeProducts?orderId=xxx
         * 返回订单中可申请纠纷的商品列表（lineItemId, canChoose, price, quantity）。
         */
        if (!args.orderId) {
          return { content: [{ type: 'text', text: '❌ 请提供 orderId / Please provide orderId.' }], isError: true };
        }
        const productsResp = await httpClient.request(ENDPOINTS.disputes.disputeProducts, {
          method: 'GET',
          params: { orderId: String(args.orderId) },
          tier: 'read',
        });
        if (!isApiSuccess(productsResp)) {
          return { content: [{ type: 'text', text: `查询可纠纷商品失败 / Get dispute products failed: ${productsResp.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(productsResp.data, null, 2) }] };
      }

      case 'create_dispute': {
        /**
         * @note 第24次提交: 修复 create_dispute，使用正确参数字段名（非 reason/description）。
         * ⚠️ 必须先调用 get_dispute_products + confirm_dispute 获取 lineItemId 和 disputeReasonId。
         * 必填字段: orderId, disputeReasonId(int), expectType(int), messageText, productInfoList
         * businessDisputeId 由 handler 自动生成。
         */
        const { orderId, disputeReasonId, expectType, messageText, productInfoList } = args;
        if (!orderId || !disputeReasonId || !expectType || !messageText || !Array.isArray(productInfoList) || productInfoList.length === 0) {
          return {
            content: [{
              type: 'text',
              text: '❌ 缺少必填字段。开纠纷流程：\n' +
                '  1. 先调用 get_dispute_products(orderId) 获取 lineItemId\n' +
                '  2. 再调用 confirm_dispute(orderId, productInfoList) 获取 disputeReasonId 列表\n' +
                '  3. 最后调用此工具，传入 orderId/disputeReasonId/expectType/messageText/productInfoList\n\n' +
                'Missing required fields. Dispute creation flow:\n' +
                '  1. call get_dispute_products(orderId) to get lineItemId\n' +
                '  2. call confirm_dispute(orderId, productInfoList) to get disputeReasonId\n' +
                '  3. call this tool with all required fields',
            }],
            isError: true,
          };
        }
        const businessDisputeId = `MCP-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        return await callApi(ENDPOINTS.disputes.create, {
          orderId: String(orderId),
          businessDisputeId,
          disputeReasonId: Number(disputeReasonId),
          expectType: Number(expectType),
          refundType: args.refundType ? Number(args.refundType) : 1,
          messageText: String(messageText),
          imageUrl: Array.isArray(args.imageUrl) ? args.imageUrl : [],
          productInfoList,
        }, 'write');
      }

      case 'cancel_dispute':
        return await callApi(ENDPOINTS.disputes.cancel, {
          orderId: args.orderId,
          disputeId: args.disputeId,
        }, 'write');

      case 'list_disputes': {
        /**
         * @note 纠正: disputes/getDisputeList 是 GET 接口
         */
        const params: Record<string, string> = {
          pageNum: String((args.pageNum as number) || 1),
          pageSize: String(Math.min((args.pageSize as number) || 20, 50)),
        };
        if (args.status) params.status = String(args.status);
        const listResp = await httpClient.request(ENDPOINTS.disputes.getDisputeList, {
          method: 'GET',
          params,
          tier: 'read',
        });
        if (!isApiSuccess(listResp)) {
          return { content: [{ type: 'text', text: `查询纠纷失败 / List disputes failed: ${listResp.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(listResp.data, null, 2) }] };
      }

      case 'get_dispute_detail': {
        /**
         * @note 纠正(16次): 原实现错误地调用 disputeConfirmInfo(POST)。
         * 实际API是 GET /disputes/getDisputeDetail?disputeId=xxx，只需 disputeId 参数。
         */
        if (!args.disputeId) {
          return { content: [{ type: 'text', text: '❌ 请提供 disputeId / Please provide disputeId.' }], isError: true };
        }
        const detailResp = await httpClient.request(ENDPOINTS.disputes.getDisputeDetail, {
          method: 'GET',
          params: { disputeId: String(args.disputeId) },
          tier: 'read',
        });
        if (!isApiSuccess(detailResp)) {
          return { content: [{ type: 'text', text: `查询纠纷详情失败 / Get dispute detail failed: ${detailResp.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(detailResp.data, null, 2) }] };
      }

      case 'confirm_dispute': {
        /**
         * @note 第24次提交: 修正 confirm_dispute 为只读操作。
         * POST /disputes/disputeConfirmInfo - 实际是查询接口，返回可选的 disputeReasonList、
         * expectResultOptionList 和最大退款金额，用于填写 create_dispute 的参数。
         * 不是"确认"操作，是"获取表单选项"操作，改为 read tier，不注册为 sensitive。
         */
        if (!args.orderId || !Array.isArray(args.productInfoList) || args.productInfoList.length === 0) {
          return { content: [{ type: 'text', text: '❌ 请提供 orderId 和 productInfoList / Please provide orderId and productInfoList.' }], isError: true };
        }
        const confirmResp = await httpClient.request(ENDPOINTS.disputes.disputeConfirmInfo, {
          body: {
            orderId: String(args.orderId),
            productInfoList: args.productInfoList,
          },
          tier: 'read',
        });
        if (!isApiSuccess(confirmResp)) {
          return { content: [{ type: 'text', text: `查询纠纷选项失败 / Get dispute options failed: ${confirmResp.message}` }], isError: true };
        }
        return {
          content: [{
            type: 'text',
            text: `✅ 纠纷选项查询成功，请将以下信息传给 create_dispute:\n` +
              `  - disputeReasonId: 从 disputeReasonList 中选择整数ID\n` +
              `  - expectType: 从 expectResultOptionList 中选择 (1=退款/Refund, 2=补发/Reissue)\n\n` +
              JSON.stringify(confirmResp.data, null, 2),
          }],
        };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown dispute tool: ${name}` }], isError: true };
    }
  } catch (error: unknown) {
    if (error instanceof AuthExpiredError) {
      return { content: [{ type: 'text', text: error.message }], isError: true };
    }
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
  }
}

async function callApi(
  endpoint: string,
  body: Record<string, unknown>,
  tier: 'read' | 'write'
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const response = await httpClient.request(endpoint, { body, tier });
  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `请求失败 / Request failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

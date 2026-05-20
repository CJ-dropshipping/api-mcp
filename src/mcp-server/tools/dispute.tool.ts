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
    name: 'create_dispute',
    description:
      '发起纠纷/退款申请。当订单出现质量问题、物流丢失、商品不符时使用 / ' +
      'Create a dispute/refund request. Used when order has quality issues, lost shipment, or wrong items.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: { type: 'string', description: '订单ID / Order ID' },
        reason: { type: 'string', description: '纠纷原因 / Dispute reason' },
        description: { type: 'string', description: '详细描述 / Detailed description' },
        imageUrls: {
          type: 'array',
          items: { type: 'string' },
          description: '凭证图片URL列表 / Evidence image URL list',
        },
      },
      required: ['orderId', 'reason'],
    },
  },
  {
    name: 'cancel_dispute',
    description:
      '取消纠纷申请。在问题解决或协商一致后撤回纠纷 / ' +
      'Cancel a dispute request. Withdraw dispute after issue resolved or agreement reached.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        disputeId: { type: 'string', description: '纠纷ID / Dispute ID' },
      },
      required: ['disputeId'],
    },
  },
  {
    name: 'list_disputes',
    description:
      '查询纠纷列表，查看所有进行中和已结束的纠纷记录。\n' +
      '【参数映射规则】\n' +
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
  {
    name: 'confirm_dispute',
    description:
      '⚠️【敏感操作 - 需用户确认】提交纠纷确认信息，操作提交后不可更改。\n' +
      '触发场景：「确认这个纠纷」「同意纠纷处理结果」「confirm dispute」。\n' +
      '⚠️ AI 必须先展示纠纷详情给用户确认后再调用此工具。获取 lineItemId 请使用 get_order_detail。\n' +
      '参数： orderId（CJ订单号，必填）、productInfoList（商品列表、必填）。',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: { type: 'string', description: 'CJ订单号（必填）/ CJ Order ID (required)' },
        productInfoList: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              lineItemId: { type: 'string', description: '行项目ID / Line item ID' },
              quantity: { type: 'number', description: '数量 / Quantity' },
              price: { type: 'number', description: '单价USD / Unit price in USD' },
            },
            required: ['lineItemId', 'quantity'],
          },
          description: '商品信息列表（从 get_dispute_detail 结果获取）/ Product info list (from get_dispute_detail result)',
        },
      },
      required: ['orderId', 'productInfoList'],
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
      case 'create_dispute':
        return await callApi(ENDPOINTS.disputes.create, {
          orderId: args.orderId,
          reason: args.reason,
          description: args.description,
          imageUrls: args.imageUrls,
        }, 'write');

      case 'cancel_dispute':
        return await callApi(ENDPOINTS.disputes.cancel, {
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
         * @note 纠正(13次): 新增 confirm_dispute 工具，提交纠纷确认信息。
         * ⚠️ 敏感操作：确认纠纷处理结果，提交后不可更改。
         * sensitive-ops.ts 已注册，AI 调用前会看到确认提示。
         * 参数：orderId（必填）、productInfoList（必填，含 lineItemId/quantity/price）。
         */
        if (!args.orderId || !Array.isArray(args.productInfoList) || args.productInfoList.length === 0) {
          return { content: [{ type: 'text', text: '❌ 请提供 orderId 和 productInfoList / Please provide orderId and productInfoList.' }], isError: true };
        }
        const confirmResp = await httpClient.request(ENDPOINTS.disputes.disputeConfirmInfo, {
          body: {
            orderId: String(args.orderId),
            productInfoList: args.productInfoList,
          },
          tier: 'write',
        });
        if (!isApiSuccess(confirmResp)) {
          return { content: [{ type: 'text', text: `纠纷确认失败 / Confirm dispute failed: ${confirmResp.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: `✅ 纠纷确认已提交 / Dispute confirmation submitted:\n${JSON.stringify(confirmResp.data, null, 2)}` }] };
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

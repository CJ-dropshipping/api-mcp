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
      '获取纠纷详情，包含纠纷进度、协商记录、处理结果 / ' +
      'Get dispute detail including progress, negotiation history, and resolution.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: { type: 'string', description: '订单ID / Order ID' },
        disputeId: { type: 'string', description: '纠纷ID / Dispute ID' },
        productInfoList: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              lineItemId: { type: 'string', description: '行项目ID / Line item ID' },
              cjProductId: { type: 'string', description: 'CJ商品ID / CJ product ID' },
              quantity: { type: 'number', description: '数量 / Quantity' },
            },
            required: ['lineItemId', 'cjProductId'],
          },
          description: '商品信息列表(从list_disputes结果获取) / Product info list (from list_disputes result)',
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
         * @note disputes/disputeConfirmInfo 是 POST 接口
         * @note 需要 orderId + productInfoList（从 list_disputes 获取）
         */
        const detailResp = await httpClient.request(ENDPOINTS.disputes.disputeConfirmInfo, {
          body: {
            orderId: String(args.orderId),
            disputeId: args.disputeId ? String(args.disputeId) : undefined,
            productInfoList: args.productInfoList,
          },
          tier: 'read',
        });
        if (!isApiSuccess(detailResp)) {
          return { content: [{ type: 'text', text: `查询纠纷详情失败 / Get dispute detail failed: ${detailResp.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(detailResp.data, null, 2) }] };
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

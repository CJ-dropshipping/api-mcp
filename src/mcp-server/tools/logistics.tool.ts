/**
 * @fileoverview 物流运费 MCP Tools
 * - calculate_freight: 运费试算 (对应 /logistic/freightCalculate)
 * - get_logistics_timeliness: 物流时效查询 (对应 /logistic/logisticsTimeliness)
 *
 * 描述参考 mycj-react 中运费计算器、物流方式选择的业务场景
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient, AuthExpiredError, isApiSuccess } from '../../api-client/http-client.js';
import { ENDPOINTS } from '../../api-client/endpoints.js';
import { ensureAccessToken } from '../../auth/session.js';

export const logisticsTools: Tool[] = [
  {
    name: 'calculate_freight',
    description:
      '运费试算，根据目的国、重量、物流方式计算预估运费。适用于选品成本评估、比价 / ' +
      'Calculate shipping cost by destination country, weight, and logistics method. Used for product cost evaluation and price comparison.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        startCountryCode: {
          type: 'string',
          description: '发货国家代码(如CN) / Origin country code (e.g. CN)',
        },
        endCountryCode: {
          type: 'string',
          description: '目的国家代码(如US) / Destination country code (e.g. US)',
        },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              quantity: { type: 'number', description: '数量 / Quantity' },
              vid: { type: 'string', description: '变体ID / Variant ID (from product search results)' },
            },
            required: ['quantity', 'vid'],
          },
          description: '商品列表(必填)，需要variant ID / Product list (required), needs variant IDs from search_products',
        },
      },
      required: ['endCountryCode', 'products'],
    },
  },
  {
    name: 'get_logistics_timeliness',
    description:
      '查询物流时效，获取从发货到目的国的预计送达时间和可用物流方式 / ' +
      'Query logistics timeliness. Get estimated delivery time and available shipping methods to destination country.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        startCountryCode: {
          type: 'string',
          description: '发货国家代码，默认CN / Origin country code, default CN',
        },
        endCountryCode: {
          type: 'string',
          description: '目的国家代码(如US、GB、DE) / Destination country code (e.g. US, GB, DE)',
        },
      },
      required: ['endCountryCode'],
    },
  },
];

export async function handleLogisticsTool(
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
      case 'calculate_freight':
        return await handleCalculateFreight(args);
      case 'get_logistics_timeliness':
        return await handleLogisticsTimeliness(args);
      default:
        return { content: [{ type: 'text', text: `Unknown logistics tool: ${name}` }], isError: true };
    }
  } catch (error: unknown) {
    if (error instanceof AuthExpiredError) {
      return { content: [{ type: 'text', text: error.message }], isError: true };
    }
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
  }
}

async function handleCalculateFreight(args: Record<string, unknown>) {
  const body: Record<string, unknown> = {
    startCountryCode: args.startCountryCode || 'CN',
    endCountryCode: args.endCountryCode,
    products: args.products,
  };

  const response = await httpClient.request(ENDPOINTS.logistic.freightCalculate, {
    body,
    tier: 'read',
  });

  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `运费计算失败 / Freight calculation failed: ${response.message}` }], isError: true };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
  };
}

async function handleLogisticsTimeliness(args: Record<string, unknown>) {
  /**
   * @note 纠正: logistic/logisticsTimeliness 是 GET 接口
   * 参数名是 srcAreaCode / destAreaCode (非 startCountryCode / endCountryCode)
   */
  const response = await httpClient.request(ENDPOINTS.logistic.logisticsTimeliness, {
    method: 'GET',
    params: {
      srcAreaCode: String(args.startCountryCode || 'CN'),
      destAreaCode: String(args.endCountryCode),
    },
    tier: 'read',
  });

  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `时效查询失败 / Timeliness query failed: ${response.message}` }], isError: true };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
  };
}

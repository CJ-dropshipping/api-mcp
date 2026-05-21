/**
 * @fileoverview Webhook 管理 MCP Tools
 * 对应 OpenAPI Webhook 域端点
 * 配置 CJ 事件通知推送的目标 URL
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient, AuthExpiredError, isApiSuccess } from '../../api-client/http-client.js';
import { ENDPOINTS } from '../../api-client/endpoints.js';
import { ensureAccessToken } from '../../auth/session.js';

export const webhookTools: Tool[] = [
  {
    name: 'configure_webhook',
    description: [
      '配置 CJ Webhook 消息推送设置，可启用/禁用商品/库存/订单/物流等事件的 HTTPS 回调通知。',
      '⚠️【敏感操作 - 需用户确认】此操作将修改账户的 Webhook 回调 URL 配置，影响所有事件通知的推送目标。',
      '触发场景：「设置 Webhook 通知」「配置事件推送」「订阅订单状态变更通知」「configure webhook」。',
      '注意：callbackUrl 必须是可公开访问的 HTTPS 地址（不支持 localhost/127.0.0.1）。',
      '每种事件类型只支持一个回调 URL。type 字段值：ENABLE（启用）或 CANCEL（禁用）。',
      '四种事件类型均为必填：product（商品变更）、stock（库存变更）、order（订单状态）、logistics（物流信息）。',
    ].join(' '),
    inputSchema: {
      type: 'object' as const,
      properties: {
        callbackUrl: {
          type: 'string',
          description: '统一回调 URL（必须是公开 HTTPS 地址）/ Unified callback URL (must be public HTTPS)',
        },
        productType: {
          type: 'string',
          enum: ['ENABLE', 'CANCEL'],
          description: '商品消息类型 ENABLE/CANCEL，默认 ENABLE / Product event type',
        },
        stockType: {
          type: 'string',
          enum: ['ENABLE', 'CANCEL'],
          description: '库存消息类型 ENABLE/CANCEL，默认 ENABLE / Stock event type',
        },
        orderType: {
          type: 'string',
          enum: ['ENABLE', 'CANCEL'],
          description: '订单消息类型 ENABLE/CANCEL，默认 ENABLE / Order event type',
        },
        logisticsType: {
          type: 'string',
          enum: ['ENABLE', 'CANCEL'],
          description: '物流消息类型 ENABLE/CANCEL，默认 ENABLE / Logistics event type',
        },
      },
      required: ['callbackUrl'],
    },
  },
];

export async function handleWebhookTool(
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
      case 'configure_webhook': {
        /**
         * @note 新增(第15次): configure_webhook，POST /webhook/set。
         * ⚠️ 敏感操作：修改账户Webhook回调URL配置。
         * callbackUrl 必须是公开 HTTPS 地址，4种事件类型均配置到同一 URL。
         */
        if (!args.callbackUrl) {
          return {
            content: [{ type: 'text', text: '❌ 请提供 callbackUrl（必须是公开 HTTPS 地址）/ Please provide callbackUrl (must be a public HTTPS URL).' }],
            isError: true,
          };
        }
        const url = String(args.callbackUrl);
        if (!url.startsWith('https://')) {
          return {
            content: [{ type: 'text', text: '❌ callbackUrl 必须以 https:// 开头 / callbackUrl must start with https://' }],
            isError: true,
          };
        }
        const productType = String(args.productType || 'ENABLE');
        const stockType = String(args.stockType || 'ENABLE');
        const orderType = String(args.orderType || 'ENABLE');
        const logisticsType = String(args.logisticsType || 'ENABLE');

        const body = {
          product: { type: productType, callbackUrls: [url] },
          stock: { type: stockType, callbackUrls: [url] },
          order: { type: orderType, callbackUrls: [url] },
          logistics: { type: logisticsType, callbackUrls: [url] },
        };

        const response = await httpClient.request(ENDPOINTS.webhook.set, { body, tier: 'write' });
        if (!isApiSuccess(response)) {
          return { content: [{ type: 'text', text: `Webhook 配置失败 / Configure webhook failed: ${response.message}` }], isError: true };
        }
        return {
          content: [{
            type: 'text',
            text: [
              '✅ Webhook 配置已更新 / Webhook configured successfully.',
              `\n- product: ${productType} → ${url}`,
              `\n- stock: ${stockType} → ${url}`,
              `\n- order: ${orderType} → ${url}`,
              `\n- logistics: ${logisticsType} → ${url}`,
            ].join(''),
          }],
        };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown webhook tool: ${name}` }], isError: true };
    }
  } catch (error: unknown) {
    if (error instanceof AuthExpiredError) {
      return { content: [{ type: 'text', text: error.message }], isError: true };
    }
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
  }
}

/**
 * @fileoverview 物流运费 MCP Tools
 * - calculate_freight: 运费试算 (对应 /logistic/freightCalculate)
 * - get_logistics_timeliness: 物流时效查询 (对应 /logistic/freightCalculateTip)
 *
 * 描述参考 mycj-react 中运费计算器、物流方式选择的业务场景
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient, AuthExpiredError, isApiSuccess } from '../../api-client/http-client.js';
import { ENDPOINTS, API_VERSION_PREFIX } from '../../api-client/endpoints.js';
import { ensureAccessToken } from '../../auth/session.js';
import { getEnvConfig } from '../../config/env.js';

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
        zip: {
          type: 'string',
          description: '目的国邮编，用于精确计算偏远地区运费 / Destination zip/postal code for accurate shipping cost calculation',
        },
        taxId: {
          type: 'string',
          description: '收件人税号（如欧盟IOSS税号），用于跨境税务计算 / Recipient tax ID (e.g. EU IOSS number) for cross-border tax calculation',
        },
        houseNumber: {
          type: 'string',
          description: '门牌号，部分物流需要精确地址才能计算 / House number for precise address (required by some logistics carriers)',
        },
        iossNumber: {
          type: 'string',
          description: 'IOSS税号，用于欧盟VAT代扣代缴 / IOSS number for EU VAT collection',
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
  {
    name: 'get_tracking_info',
    description:
      '查询快递包裹的实时物流追踪信息，返回当前状态、位置、预计送达时间等。支持批量查询多个快递单号。\n' +
      '【意图映射】\n' +
      '- 用户说「我的包裹到哪了」「追踪单号 CJXXX」「物流状态」「快递跟踪」→ 使用此工具\n' +
      '- 快递单号来源：先调 get_order_detail 获取订单的 trackNumber 字段，再传入此工具\n' +
      '- trackNumbers 至少传1个，支持批量\n' +
      '【重要】订单详情中的 trackNumber 仅是快递单号，不含实时物流事件；\n' +
      '       必须调用本工具才能获取真实的物流追踪数据（地点、时间节点、当前状态）。\n' +
      'Get REAL-TIME shipment tracking info: current status, location, ETA. Supports batch queries.\n' +
      '[Intent mapping] "where is my package" / "track CJXXX" / "shipping status" / "is it delivered" → use this tool.\n' +
      '[IMPORTANT] trackNumber from order detail is just a number. Call THIS tool to get actual tracking events.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        trackNumbers: {
          type: 'array',
          items: { type: 'string' },
          description: '快递单号列表（支持批量，至少1个），如 ["CJPKL7160102171YQ"] / Tracking numbers (batch supported), e.g. ["CJPKL7160102171YQ"]',
        },
      },
      required: ['trackNumbers'],
    },
  },
  {
    name: 'calculate_freight_tip',
    description: [
      '运费试算增强版，支持按平台（Shopify/WooCommerce等）过滤的运费内容试算。',
      '触发场景：「计算运费（Shopify平台）」「查看某平台的运费选项」「calculate freight tip」「某平台的适用运费方式」。',
      '必填参数：srcAreaCode（发货国）、destAreaCode（目的国）。',
    ].join(' '),
    inputSchema: {
      type: 'object' as const,
      properties: {
        srcAreaCode: { type: 'string', description: '发货国家代码（必填，如 CN）/ Origin country code (required, e.g. CN)' },
        destAreaCode: { type: 'string', description: '目的地国家代码（必填，如 US）/ Destination country code (required, e.g. US)' },
        zip: { type: 'string', description: '目的国邮编，用于偏远地区精确计算 / Destination zip code for accurate shipping cost' },
        houseNumber: { type: 'string', description: '门牌号，部分物流需要精确地址 / House number for precise address' },
        iossNumber: { type: 'string', description: 'IOSS税号，用于欧盟VAT计算 / IOSS number for EU VAT calculation' },
        storageIdList: {
          type: 'array',
          items: { type: 'string' },
          description: '分区仓库ID列表，用于指定仓库发货 / List of warehouse/storage IDs for shipping from specific warehouse',
        },
        platforms: {
          type: 'array',
          items: { type: 'string' },
          description: '平台列表，支持多平台筛选（如 shopify, ebay, amazon, tiktok, etsy）/ Platform list for filtering shipping options',
        },
        weight: {
          type: 'number',
          description: '总重量（克），用于精确运费计算 / Total weight in grams for accurate freight calculation',
        },
        volume: {
          type: 'number',
          description: '包裹总体积（立方厘米 cm³），用于计算体积重 / Total volume in cubic centimeters for volumetric weight',
        },
        totalGoodsAmount: {
          type: 'number',
          description: '货物总价值（USD），用于报关和IOSS计算 / Total goods value in USD for customs declaration and IOSS',
        },
        skuList: {
          type: 'array',
          items: { type: 'string' },
          description: 'SKU列表 / SKU list (deprecated, use freightTrialSkuList instead)',
        },
        freightTrialSkuList: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sku: { type: 'string', description: 'SKU编码 / SKU code' },
              skuQuantity: { type: 'number', description: '购买数量 / Purchase quantity' },
              skuWeight: { type: 'number', description: '单个重量（克）/ Single item weight in grams' },
              skuVolume: { type: 'number', description: '单个体积（立方厘米）/ Single item volume in cm³' },
            },
          },
          description: '试算SKU列表（推荐），支持指定数量和重量体积 / Trial SKU list with quantity and weight/volume details',
        },
      },
      required: ['srcAreaCode', 'destAreaCode'],
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
      case 'get_tracking_info':
        return await handleGetTrackingInfo(args);
      case 'calculate_freight_tip':
        return await handleCalculateFreightTip(args);
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
  if (args.zip) body.zip = String(args.zip);
  if (args.taxId) body.taxId = String(args.taxId);
  if (args.houseNumber) body.houseNumber = String(args.houseNumber);
  if (args.iossNumber) body.iossNumber = String(args.iossNumber);

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
   * @note 纠正(16次): /logistic/logisticsTimeliness 不存在于API文档。
   * 改用 POST /logistic/freightCalculateTip，传入 srcAreaCode/destAreaCode 查询时效信息。
   * freightCalculateTip 支持仅传国家代码（不强制要求 skuList），返回可用物流方案及时效。
   */
  const body: Record<string, unknown> = {
    reqDTOS: [{
      srcAreaCode: String(args.startCountryCode || 'CN'),
      destAreaCode: String(args.endCountryCode),
    }],
  };

  const response = await httpClient.request(ENDPOINTS.logistic.freightCalculateTip, {
    body,
    tier: 'read',
  });

  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `时效查询失败 / Timeliness query failed: ${response.message}` }], isError: true };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
  };
}

async function handleGetTrackingInfo(args: Record<string, unknown>) {
  /**
   * @note 纠正(12次): 新增物流追踪工具，对应 GET /logistic/trackInfo。
   * API 支持批量查询（trackNumber 重复 key），需使用 URLSearchParams.append 构造 URL，
   * httpClient 的 params（Record<string,string>）不支持同名多值，故使用 raw fetch。
   * 只读操作，无需用户二次确认。
   */
  if (!Array.isArray(args.trackNumbers) || args.trackNumbers.length === 0) {
    return {
      content: [{ type: 'text', text: '❌ 请提供至少一个快递单号 / Please provide at least one tracking number.' }],
      isError: true,
    };
  }

  const env = getEnvConfig();
  const urlParams = new URLSearchParams();
  (args.trackNumbers as string[]).filter(Boolean).forEach(t => urlParams.append('trackNumber', t));

  const url = `${env.openApiBase}${API_VERSION_PREFIX}${ENDPOINTS.logistic.trackInfo}?${urlParams.toString()}`;
  const token = await ensureAccessToken();

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'CJ-Access-Token': token ?? '', 'Content-Type': 'application/json' },
  });
  const data = await res.json();

  if (!isApiSuccess(data)) {
    return { content: [{ type: 'text', text: `物流追踪失败 / Tracking query failed: ${data.message}` }], isError: true };
  }

  return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
}

async function handleCalculateFreightTip(args: Record<string, unknown>) {
  /**
   * @note 新增(第15次): calculate_freight_tip，POST /logistic/freightCalculateTip。
   * 运费试算增强版，支持按平台过滤和SKU传参。
   * API 需要 reqDTOS 数组包装。
   */
  if (!args.srcAreaCode || !args.destAreaCode) {
    return {
      content: [{ type: 'text', text: '❌ 请提供 srcAreaCode 和 destAreaCode / Please provide srcAreaCode and destAreaCode.' }],
      isError: true,
    };
  }
  const reqDTO: Record<string, unknown> = {
    srcAreaCode: String(args.srcAreaCode),
    destAreaCode: String(args.destAreaCode),
  };
  // 详细SKU试算列表（优先使用）
  if (Array.isArray(args.freightTrialSkuList) && args.freightTrialSkuList.length > 0) {
    reqDTO.freightTrialSkuList = args.freightTrialSkuList.map((item: unknown) => {
      const s = item as Record<string, unknown>;
      return {
        sku: s.sku,
        skuQuantity: s.skuQuantity ?? 1,
        skuWeight: s.skuWeight,
        skuVolume: s.skuVolume,
      };
    });
    // 同步 skuList 供兼容性
    reqDTO.skuList = (args.freightTrialSkuList as Array<Record<string, unknown>>).map(i => String(i.sku)).filter(Boolean);
  } else if (Array.isArray(args.skuList) && args.skuList.length > 0) {
    // 降级：仅有简单 SKU 列表
    reqDTO.skuList = args.skuList;
    reqDTO.freightTrialSkuList = args.skuList.map((sku: unknown) => ({
      sku: String(sku),
      skuQuantity: 1,
    }));
  }
  // 平台支持数组或单个值
  if (args.platforms && Array.isArray(args.platforms) && args.platforms.length > 0) {
    reqDTO.platforms = args.platforms;
  } else if (args.platform) {
    reqDTO.platforms = [String(args.platform)];
  }
  if (args.zip) reqDTO.zip = String(args.zip);
  if (args.houseNumber) reqDTO.houseNumber = String(args.houseNumber);
  if (args.iossNumber) reqDTO.iossNumber = String(args.iossNumber);
  if (Array.isArray(args.storageIdList) && args.storageIdList.length > 0) {
    reqDTO.storageIdList = args.storageIdList;
  }
  if (args.weight != null) reqDTO.weight = Number(args.weight);
  if (args.volume != null) reqDTO.volume = Number(args.volume);
  if (args.totalGoodsAmount !== undefined) reqDTO.totalGoodsAmount = Number(args.totalGoodsAmount);

  const response = await httpClient.request(ENDPOINTS.logistic.freightCalculateTip, {
    body: { reqDTOS: [reqDTO] },
    tier: 'read',
  });
  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `运费试算失败 / Freight calculate tip failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

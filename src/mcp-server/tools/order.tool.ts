/**
 * @fileoverview 订单/购物车 MCP Tools
 * 对应 OpenAPI Shopping 域端点
 * 描述参考 mycj-react 中购物车、下单、合单的业务场景
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient, AuthExpiredError, isApiSuccess } from '../../api-client/http-client.js';
import { ENDPOINTS, API_VERSION_PREFIX } from '../../api-client/endpoints.js';
import { ensureAccessToken } from '../../auth/session.js';
import { getEnvConfig } from '../../config/env.js';
import { logger, isDebugMode } from '../../utils/logger.js';
import { setOrderListCache, setOrderDetailCache } from '../resources/index.js';

export const orderTools: Tool[] = [
  {
    name: 'add_to_cart',
    description:
      '将商品加入购物车，支持指定变体和数量。适用于选品后批量加购 / ' +
      'Add product to shopping cart with variant and quantity. Used for batch adding after product sourcing.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        vid: { type: 'string', description: '商品变体ID / Product variant ID' },
        quantity: { type: 'number', description: '数量，默认1 / Quantity, default 1' },
      },
      required: ['vid'],
    },
  },
  {
    name: 'create_order',
    description:
      '⚠️【创建订单 - 必须一次性提供所有必填字段，字段名必须与 schema 完全一致，不可自行重命名】\n' +
      '调用前请确认已知以下全部信息，如有缺失须先向用户询问：\n' +
      '  orderNumber（自定义唯一订单号）、shippingCustomerName（收件人姓名）、\n' +
      '  shippingPhone（收件人电话）、shippingCountry（收件国家全称）、\n' +
      '  shippingCountryCode（2位国家代码）、shippingProvince（省/州）、\n' +
      '  shippingCity（城市）、shippingAddress（街道地址）、shippingZip（邮编）、\n' +
      '  logisticName（物流名称，须先通过 calculate_freight 获取）、\n' +
      '  fromCountryCode（发货国代码，通常 "CN"）、products[{vid, quantity}]\n' +
      '成功后将返回订单ID和支付链接。\n\n' +
      'Create order (V2). All required field names MUST match exactly as defined in the schema properties.\n' +
      'DO NOT rename fields. Collect ALL required fields before calling.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderInfo: {
          type: 'object',
          description: '订单参数，字段名必须与下方 properties 完全一致 / Order params — field names must match properties exactly',
          properties: {
            orderNumber: { type: 'string', description: '唯一订单号（必填）/ Unique order number (required)' },
            shippingCustomerName: { type: 'string', description: '收件人姓名（必填）/ Recipient name (required)' },
            shippingPhone: { type: 'string', description: '收件人电话 / Recipient phone' },
            shippingCountry: { type: 'string', description: '收件国家全称，如 "United States"（必填）/ Full country name (required)' },
            shippingCountryCode: { type: 'string', description: '2位国家代码，如 "US"（必填）/ 2-letter country code (required)' },
            shippingProvince: { type: 'string', description: '省/州（必填）/ Province or state (required)' },
            shippingCity: { type: 'string', description: '城市（必填）/ City (required)' },
            shippingAddress: { type: 'string', description: '街道地址（必填）/ Street address (required)' },
            shippingZip: { type: 'string', description: '邮编 / ZIP code' },
            logisticName: { type: 'string', description: '物流名称（必填），来自 calculate_freight 返回值 / Logistics name from calculate_freight (required)' },
            fromCountryCode: { type: 'string', description: '发货国代码（必填），通常为 "CN" / Source country code, usually "CN" (required)' },
            products: {
              type: 'array',
              description: '商品列表（必填）/ Product list (required)',
              items: {
                type: 'object',
                properties: {
                  vid: { type: 'string', description: '变体ID / Variant ID' },
                  quantity: { type: 'number', description: '数量 / Quantity' },
                },
                required: ['vid', 'quantity'],
              },
            },
          },
          required: ['orderNumber', 'shippingCustomerName', 'shippingCountry', 'shippingCountryCode', 'shippingProvince', 'shippingCity', 'shippingAddress', 'logisticName', 'fromCountryCode', 'products'],
        },
      },
      required: ['orderInfo'],
    },
  },
  {
    name: 'submit_order_to_cart',
    description:
      '⚠️【敏感操作】从已创建的订单ID继续后续流程：加购物车→确认购物车→生成支付单，返回支付链接。\n' +
      '适用场景：create_order 成功返回 orderId 后，用此工具继续完成支付流程。\n' +
      '执行步骤：addCart(orderId) → addCartConfirm(orderId) → saveGenerateParentOrder(shipmentsId) → 返回支付链接\n\n' +
      'Submit order to cart and generate payment link from an existing orderId.\n' +
      'Use after create_order succeeds. Runs: addCart → addCartConfirm → saveGenerateParentOrder.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: {
          type: 'string',
          description: 'createOrderV2 返回的 CJ 订单ID（必填）/ CJ order ID from createOrderV2 (required)',
        },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'confirm_cart_and_pay',
    description:
      '⚠️【敏感操作】从已在购物车中的订单ID继续：确认购物车→生成支付单，返回支付链接。\n' +
      '适用场景：addCart 已成功，但 addCartConfirm 尚未执行时从此工具继续。\n' +
      '执行步骤：addCartConfirm(orderId) → saveGenerateParentOrder(shipmentsId) → 返回支付链接\n\n' +
      'Confirm cart and generate payment from an orderId already in cart.\n' +
      'Use when addCart succeeded but addCartConfirm not yet called.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: {
          type: 'string',
          description: '已加入购物车的 CJ 订单ID（必填）/ CJ order ID already in cart (required)',
        },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'generate_payment_link',
    description:
      '⚠️【敏感操作】从已确认购物车后的 shipmentsId 生成支付单，返回支付链接。\n' +
      '适用场景：addCartConfirm 成功返回 shipmentsId 后，用此工具生成最终支付链接。\n' +
      '执行步骤：saveGenerateParentOrder(shipmentsId) → 返回 payId 和支付链接\n\n' +
      'Generate payment order and return payment URL from a shipmentsId.\n' +
      'Use after addCartConfirm returns shipmentsId.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        shipmentsId: {
          type: 'string',
          description: 'addCartConfirm 返回的 Shipment Order ID（必填）/ shipmentsId from addCartConfirm (required)',
        },
      },
      required: ['shipmentsId'],
    },
  },
  {
    name: 'merge_orders',
    description:
      '自动合单，将多个待处理订单合并以节省运费。适用于批量订单优化 / ' +
      'Auto merge orders to save shipping cost. Used for batch order optimization.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderIds: {
          type: 'array',
          items: { type: 'string' },
          description: '需要合并的订单ID列表 / List of order IDs to merge',
        },
      },
      required: ['orderIds'],
    },
  },
  {
    name: 'get_merge_progress',
    description:
      '查询合单进度，合单是异步操作需要轮询 / ' +
      'Check merge order progress. Merge is async and requires polling.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        taskId: { type: 'string', description: '合单任务ID / Merge task ID' },
      },
      required: ['taskId'],
    },
  },
  {
    /**
     * @note 调整(68次): 将 get_order_list 移到 get_pay_order_list 前面。
     * 原因：AI 工具列表按顺序扫描，越靠前的工具越容易被优先匹配。
     * 「查订单」「最近的订单」「历史订单」等通用查询意图应命中本工具，
     * 而非后面的 get_pay_order_list（仅待支付）。
     */
    name: 'get_order_list',
    description:
      '✅【订单列表查询入口】用户说「查订单」「查全部订单」「历史订单」「看看我的订单」→ 使用此工具！\n' +
      '【两步展示流程 - 必须按顺序执行】\n' +
      '  第1步：先调用本工具 get_order_list 获取最新数据\n' +
      '  第2步：再调用 show_order_list 打开可视化卡片界面（数据已缓存）\n' +
      '⚠️ 本工具仅获取数据，不渲染 UI；UI 渲染由 show_order_list 独立完成。\n' +
      '⚠️ 不要尝试在本工具的返回结果中注入 _meta.ui，那样会导致 UI 在数据到达前就渲染（旧数据）。\n' +
      '【参数映射规则】\n' +
      '- 「查订单」「查所有订单」→ 无需参数\n' +
      '- 「最近一笔订单」→ sortByLatest=true\n' +
      '- 「已发货的订单」→ status="SHIPPED"\n' +
      '- 「已取消的」→ status="CANCELLED"\n' +
      'Query order list.\n' +
      '【Two-step display - MUST call in order】\n' +
      '  Step1: Call this tool (get_order_list) to fetch data\n' +
      '  Step2: Call show_order_list to render the visual card UI (data already cached)\n' +
      '⚠️ This tool fetches data ONLY; UI rendering is done by show_order_list separately.\n' +
      '[Intent mapping] "show orders" / "my orders" / "order history" / "recent orders" → this tool.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pageNum: { type: 'number', description: '页码，从1开始 / Page number (starts from 1)' },
        pageSize: { type: 'number', description: '每页数量，默认10，最大50 / Page size, default 10, max 50' },
        sortByLatest: {
          type: 'boolean',
          description: '【快捷参数】传 true 时等同于 pageSize=1，获取最新一笔订单 / Shortcut: true means pageSize=1 to get the single latest order',
        },
        status: {
          type: 'string',
          description: '订单状态筛选（可选）：shipped=已发货, complete=已完成, cancel=已取消, processing=处理中 / Order status filter (optional): shipped, complete, cancel, processing',
        },
        orderIds: {
          type: 'array',
          items: { type: 'string' },
          description: '(可选) 按订单ID列表精确查询，最多100个 / (Optional) Filter by specific order IDs, max 100',
        },
        shipmentOrderId: {
          type: 'string',
          description: '(可选) 按发货单号查询 / (Optional) Filter by shipment order ID',
        },
      },
      required: [],
    },
  },
  {
    /**
     * @note 调整(68次): 移到 get_order_list 之后，强化描述仅适用待支付场景。
     */
    name: 'get_pay_order_list',
    description:
      '⚠️【仅待支付专用】此工具只返回待支付/未付款订单，仅在用户明确说「待支付」「未付款」「去付款」「等待付款」时才使用！\n' +
      '用户说「查订单」「最近的订单」「历史订单」「查全部订单」→ 请用 get_order_list，不要用这个工具！\n' +
      '⚠️ EXCLUSIVE to unpaid/pending-payment orders only. DO NOT use for general order queries.\n' +
      'If user asks for recent orders, order history, or all orders → use get_order_list instead.',
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
    name: 'get_order_detail',
    description:
      '查询CJ单个订单的完整详情，包括订单状态、收货地址、商品清单、物流信息、金额明细等。\n' +
      '【两步展示流程 - 必须按顺序执行】\n' +
      '  第1步：先调用本工具 get_order_detail(orderId) 获取最新数据\n' +
      '  第2步：再调用 show_order_detail(orderId) 打开可视化详情界面（数据已缓存）\n' +
      '⚠️ 本工具仅获取数据，不渲染 UI；UI 渲染由 show_order_detail(orderId) 独立完成。\n' +
      '⚠️ 不要尝试在本工具的返回结果中注入 _meta.ui，那样会导致 UI 在数据到达前就渲染（旧数据）。\n' +
      '【意图映射】\n' +
      '- 用户说「这个订单的详情」「订单详细信息」「查一下这笔订单」→ 使用此工具\n' +
      '- 用户说「这个订单发货了吗」「我的包裹在哪」→ 使用此工具\n' +
      '- orderId 必填 / orderId is required.\n' +
      '【物流追踪二步流程】\n' +
      '- 若用户问「包裹到哪了」「物流进度」「快递状态」→ 第一步调用此工具拿到 trackNumber，第二步调用 get_tracking_info([trackNumber])\n' +
      '【Two-step display - MUST call in order】\n' +
      '  Step1: Call this tool (get_order_detail) to fetch data\n' +
      '  Step2: Call show_order_detail(orderId) to render the visual detail UI (data already cached)\n' +
      '⚠️ This tool fetches data ONLY; UI rendering is done by show_order_detail(orderId) separately.' +
      '\n[Intent mapping] "order detail" / "order status" / "has it shipped" → this tool.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: {
          type: 'string',
          description: '订单ID（支持 CJ 订单号或自定义订单号）/ Order ID (CJ order ID or custom order ID)',
        },
        features: {
          type: 'array',
          items: { type: 'string' },
          description: '可选附加功能：LOGISTICS_TIMELINESS（含物流时效）/ Optional: LOGISTICS_TIMELINESS to include logistics timeliness',
        },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'get_account_balance',
    description:
      '查询CJ账户余额，包括可用余额、冻结金额、奖励金额（单位：美元）。\n' +
      '【意图映射】\n' +
      '- 用户说「我的账户余额」「我还有多少钱」「CJ余额」「账户里有多少」→ 使用此工具\n' +
      'Query CJ account balance (available, frozen, bonus amounts in USD).\n' +
      '[Intent mapping] "my balance" / "account balance" / "how much money do I have" → use this tool.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'pay_by_balance',
    description:
      '⚠️【敏感操作 - 余额支付单个订单，涉及真实资金，不可撤销】\n' +
      '适用场景：有 orderId（CJ 订单号）时走余额支付（对应 payBalance 接口）。\n' +
      '⚠️【调用前必须完成以下步骤，否则不得调用本工具】：\n' +
      '  1. 调用 get_order_detail(orderId) 获取订单金额、状态等信息\n' +
      '  2. 调用 get_account_balance() 获取账户可用余额\n' +
      '  3. 向用户完整展示：订单号、订单金额、账户余额，并明确告知「余额支付不可撤销」\n' +
      '  4. 用户明确回复"确认支付"后，才能调用本工具\n' +
      '⚠️ PAY WITH BALANCE for single order (orderId). IRREVERSIBLE. MUST first query order detail and balance, show amounts to user, get EXPLICIT confirmation before calling.\n\n' +
      '注意区分：母单支付（有 payId + shipmentOrderId）请用 pay_by_balance_v2 工具。',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: {
          type: 'string',
          description: 'CJ 订单号（必填），来自 get_order_detail 或 get_order_list / CJ Order ID (required)',
        },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'pay_by_balance_v2',
    description:
      '⚠️【敏感操作 - 余额支付母单，涉及真实资金，不可撤销】\n' +
      '适用场景：有 shipmentOrderId + payId（来自 saveGenerateParentOrder）时走余额支付（对应 payBalanceV2 接口）。\n' +
      '⚠️【调用前必须完成以下步骤，否则不得调用本工具】：\n' +
      '  1. 确保已将 saveGenerateParentOrder 返回的 paymentInformation（含 actualPayment、freight、commodityTotalAmount）展示给用户\n' +
      '  2. 调用 get_account_balance() 获取账户可用余额\n' +
      '  3. 向用户完整展示：实付金额(actualPayment)、运费(freight)、商品总额、账户余额，明确告知「余额支付不可撤销」\n' +
      '  4. 用户明确回复"确认支付"后，才能调用本工具\n' +
      '⚠️ PAY WITH BALANCE for parent/shipment order (shipmentOrderId+payId). IRREVERSIBLE. MUST first show paymentInformation amounts and balance to user, get EXPLICIT confirmation before calling.\n\n' +
      '注意区分：单个订单支付（只有 orderId）请用 pay_by_balance 工具。',
    inputSchema: {
      type: 'object' as const,
      properties: {
        shipmentOrderId: {
          type: 'string',
          description: '母单 Shipment Order ID（必填），来自 saveGenerateParentOrder / Shipment Order ID from saveGenerateParentOrder (required)',
        },
        payId: {
          type: 'string',
          description: '支付单 ID（必填），来自 saveGenerateParentOrder 返回的 payId / payId from saveGenerateParentOrder (required)',
        },
      },
      required: ['shipmentOrderId', 'payId'],
    },
  },
  {
    name: 'confirm_order',
    description:
      '⚠️【敏感操作 - 需用户确认】确认订单并触发付款，操作不可撤销，将扣除账户余额。\n' +
      '触发场景：「确认订单 D202505XXX」「我要付这个订单」「确认付款」「confirm this order」。\n' +
      '⚠️ 此操作会直接扣款，AI 必须在执行前明确告知用户"此操作将扣款并不可撤销"，确认用户同意后再调用。\n' +
      '参数：orderId（CJ订单号，必填）。',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: { type: 'string', description: 'CJ订单号（必填）/ CJ Order ID (required)' },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'delete_order',
    description:
      '⚠️【敏感操作 - 需用户确认】删除订单，操作不可恢复。\n' +
      '触发场景：「删除订单 D202505XXX」「取消并删除这个订单」「delete order」。\n' +
      '⚠️ 此操作不可撤销，AI 必须在执行前明确告知用户"此操作将永久删除该订单"，确认用户同意后再调用。\n' +
      '参数：orderId（CJ订单号，必填）。',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: { type: 'string', description: 'CJ订单号（必填）/ CJ Order ID (required)' },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'query_cogs',
    description: [
      '查询订单的采购成本（COGS）基础数据，包含商品金额、运费、税费等明细。',
      '触发场景：「查一下这些订单的成本」「订单采购价格是多少」「COGS query」「订单的货物成本」。',
      '参数 orderCodesList 为 CJ 订单号数组（必填，每次可批量查询多个）。',
    ].join(' '),
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderCodesList: {
          type: 'array',
          items: { type: 'string' },
          description: 'CJ订单号数组（必填）/ Array of CJ order codes (required)',
        },
      },
      required: ['orderCodesList'],
    },
  },
  {
    name: 'show_order_list',
    description:
      '【UI展示工具】在 MCP Apps 界面中以可视化卡片形式展示订单列表。\n' +
      '调用时机：在 get_order_list 返回结果后立即调用此工具，以提供更直观的视觉展示。\n' +
      '⚠️ 必须先调用 get_order_list 获取数据，本工具不获取数据，仅展示已缓存的订单界面。\n' +
      '[UI tool] Show order list in visual card interface. Use after get_order_list. Does NOT fetch data itself.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'show_order_detail',
    description:
      '【UI展示工具 - 只读】在 MCP Apps 界面中以可视化方式展示单个订单详情，含状态、收货地址、商品清单、物流信息、金额明细。\n' +
      '调用时机：在 get_order_detail 返回结果后立即调用此工具，以提供更直观的视觉展示。\n' +
      '本工具为只读展示，不修改任何数据。参数 orderId 必填。\n' +
      '[UI tool - READ ONLY] Show order detail in visual MCP Apps panel. Use after get_order_detail. Read-only, no data modification.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderId: { type: 'string', description: '订单ID（必填）/ Order ID (required)' },
      },
      required: ['orderId'],
    },
  },
];

let orderListUriSeq = 0;

/**
 * MCP Apps UI 资源 URI 前缀（带查询参数的完整 URI）。
 * 用于所有工具的 _meta.ui.resourceUri，确保 Claude Desktop 识别每个工具都关联了 UI。
 */
const ORDER_LIST_UI_URI = 'ui://cj-mcp/order-list';
const ORDER_DETAIL_UI_URI = 'ui://cj-mcp/order-detail';

const READ_ONLY_ORDER_TOOLS = new Set([
  'get_order_list', 'get_pay_order_list', 'get_order_detail',
  'get_account_balance', 'get_merge_progress', 'query_cogs',
]);

export function getOrderTools(): Tool[] {
  const seq = ++orderListUriSeq;
  const ts = Date.now();
  return orderTools.map(tool => {
    const annotations = READ_ONLY_ORDER_TOOLS.has(tool.name) ? { readOnlyHint: true } : undefined;
    // 只有展示工具（show_order_list / show_order_detail）才注入 _meta.ui.resourceUri，
    // 数据返回工具（get_order_list / get_order_detail 等）不应注入 _meta.ui，
    // 否则 MCP 客户端会在工具调用前就预渲染 UI（显示旧缓存数据），
    // 且同一个数据工具 + 展示工具会同时触发 UI 渲染导致重复显示两次。
    if (tool.name === 'show_order_list') {
      return { ...tool, annotations, _meta: { ui: { resourceUri: `${ORDER_LIST_UI_URI}?t=${ts}_${seq}` } } };
    }
    if (tool.name === 'show_order_detail') {
      return { ...tool, annotations, _meta: { ui: { resourceUri: `${ORDER_DETAIL_UI_URI}?t=${ts}_${seq}` } } };
    }
    // 数据返回工具不注入 _meta.ui，仅标注 readOnlyHint
    return { ...tool, annotations };
  });
}

/** 工具返回类型：支持 text/resource content + _meta */
type OrderToolResult = { content: Array<Record<string, unknown>>; isError?: boolean; _meta?: Record<string, unknown> };

export async function handleOrderTool(
  name: string,
  args: Record<string, unknown>
): Promise<OrderToolResult> {
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
      case 'add_to_cart':
        return await callApi(ENDPOINTS.shopping.addCart, {
          vid: args.vid,
          quantity: (args.quantity as number) || 1,
        }, 'write');

      case 'create_order': {
        /**
         * @note 纠正(17次): 改用 createOrderV2 端点。
         * @note 纠正(18次): inputSchema 明确声明 orderInfo 子字段名；handler 层字段名容错映射。
         * @note 纠正(19次): 实现完整下单流程（4步）：
         *   1. createOrderV2  → 得到 orderId（CJ订单号）
         *   2. addCart        → 将订单加入购物车
         *   3. addCartConfirm → 确认购物车，返回 shipmentsId
         *   4. saveGenerateParentOrder → 生成支付单，返回 payId
         *   5. 拼接支付链接：{webBase}/mine/payment?pid={payId}
         */
        // --- 字段名容错映射 / Field-name normalization ---
        const rawInfo = (args.orderInfo ?? {}) as Record<string, unknown>;

        // 若 shippingAddress 传成了嵌套对象，把其中子字段展开到顶层
        if (rawInfo.shippingAddress && typeof rawInfo.shippingAddress === 'object') {
          const nested = rawInfo.shippingAddress as Record<string, unknown>;
          const keyMap: Record<string, string> = {
            receiverName: 'shippingCustomerName', customerName: 'shippingCustomerName',
            phone: 'shippingPhone', tel: 'shippingPhone',
            country: 'shippingCountry', countryName: 'shippingCountry',
            province: 'shippingProvince', state: 'shippingProvince',
            city: 'shippingCity',
            address: 'shippingAddress', streetAddress: 'shippingAddress',
            zip: 'shippingZip', zipCode: 'shippingZip', postalCode: 'shippingZip',
          };
          for (const [nestedKey, apiKey] of Object.entries(keyMap)) {
            if (nested[nestedKey] !== undefined && rawInfo[apiKey] === undefined) {
              rawInfo[apiKey] = nested[nestedKey];
            }
          }
          if (typeof rawInfo.shippingAddress !== 'string') {
            delete rawInfo.shippingAddress;
            if (nested.address !== undefined) rawInfo.shippingAddress = nested.address;
          }
        }

        // 顶层字段名映射
        const topLevelMap: Record<string, string> = {
          logisticsName: 'logisticName', logistics: 'logisticName',
          receiverName: 'shippingCustomerName', customerName: 'shippingCustomerName', name: 'shippingCustomerName',
          phone: 'shippingPhone', tel: 'shippingPhone',
          country: 'shippingCountry', countryName: 'shippingCountry',
          countryCode: 'shippingCountryCode', endCountryCode: 'shippingCountryCode',
          province: 'shippingProvince', state: 'shippingProvince',
          city: 'shippingCity',
          address: 'shippingAddress', streetAddress: 'shippingAddress',
          zip: 'shippingZip', zipCode: 'shippingZip', postalCode: 'shippingZip',
        };
        for (const [wrong, correct] of Object.entries(topLevelMap)) {
          if (rawInfo[wrong] !== undefined && rawInfo[correct] === undefined) {
            rawInfo[correct] = rawInfo[wrong];
            delete rawInfo[wrong];
          }
        }

        // 若未提供 orderNumber，自动生成一个时间戳订单号
        if (!rawInfo.orderNumber) {
          rawInfo.orderNumber = `MCP${Date.now()}`;
        }

        // Step 1: createOrderV2
        const createV2Resp = await httpClient.request(ENDPOINTS.shopping.createOrderV2, {
          body: rawInfo,
          tier: 'write',
        });
        if (!isApiSuccess(createV2Resp)) {
          return { content: [{ type: 'text', text: `❌ [Step1/createOrderV2] 失败 / Failed: ${createV2Resp.message}` }], isError: true };
        }
        const orderData = createV2Resp.data as Record<string, unknown>;
        const createdOrderId = String(orderData?.orderId ?? '');
        if (!createdOrderId) {
          return { content: [{ type: 'text', text: '❌ [Step1/createOrderV2] 返回的 orderId 为空 / orderId is empty' }], isError: true };
        }

        // Step 2: addCart
        const addCartResp = await httpClient.request(ENDPOINTS.shopping.addCart, {
          body: { cjOrderIdList: [createdOrderId] },
          tier: 'write',
        });
        if (!isApiSuccess(addCartResp)) {
          return { content: [{ type: 'text', text: `❌ [Step2/addCart] 失败 / Failed: ${addCartResp.message}\n订单已创建 orderId: ${createdOrderId}` }], isError: true };
        }

        // Step 3: addCartConfirm
        const confirmResp = await httpClient.request(ENDPOINTS.shopping.addCartConfirm, {
          body: { cjOrderIdList: [createdOrderId] },
          tier: 'write',
        });
        if (!isApiSuccess(confirmResp)) {
          return { content: [{ type: 'text', text: `❌ [Step3/addCartConfirm] 失败 / Failed: ${confirmResp.message}\n订单已创建 orderId: ${createdOrderId}` }], isError: true };
        }
        const confirmData = confirmResp.data as Record<string, unknown>;
        const shipmentsId = String(confirmData?.shipmentsId ?? '');
        if (!shipmentsId) {
          return { content: [{ type: 'text', text: `❌ [Step3/addCartConfirm] 返回 shipmentsId 为空 / shipmentsId is empty\n订单已创建 orderId: ${createdOrderId}` }], isError: true };
        }

        // Step 4: saveGenerateParentOrder
        const parentOrderResp = await httpClient.request(ENDPOINTS.shopping.saveGenerateParentOrder, {
          body: { shipmentOrderId: shipmentsId },
          tier: 'write',
        });
        if (!isApiSuccess(parentOrderResp)) {
          return { content: [{ type: 'text', text: `❌ [Step4/saveGenerateParentOrder] 失败 / Failed: ${parentOrderResp.message}\n订单已创建 orderId: ${createdOrderId}, shipmentsId: ${shipmentsId}` }], isError: true };
        }
        const parentData = parentOrderResp.data as Record<string, unknown>;
        const payId = String(parentData?.payId ?? '');
        const webBase = getEnvConfig().webBase;
        const payUrl = payId ? `${webBase}/mine/payment?pid=${payId}` : '';

        return {
          content: [{
            type: 'text',
            text: [
              `✅ 订单创建并提交成功！/ Order created and submitted!`,
              `订单ID / Order ID: ${createdOrderId}`,
              `Shipment ID: ${shipmentsId}`,
              payUrl ? `💳 支付链接 / Payment URL: ${payUrl}` : '⚠️ payId 为空，请前往 CJ 后台查看支付',
            ].join('\n'),
          }],
        };
      }

      // ── 中间节点工具：从已有 orderId / shipmentsId 继续支付流程 ──────────────────

      case 'submit_order_to_cart': {
        // Step2: addCart → Step3: addCartConfirm → Step4: saveGenerateParentOrder
        if (!args.orderId) {
          return { content: [{ type: 'text', text: '❌ 请提供 orderId / Please provide orderId.' }], isError: true };
        }
        const sotcOrderId = String(args.orderId);

        const sotcCartResp = await httpClient.request(ENDPOINTS.shopping.addCart, {
          body: { cjOrderIdList: [sotcOrderId] },
          tier: 'write',
        });
        if (!isApiSuccess(sotcCartResp)) {
          return { content: [{ type: 'text', text: `❌ [addCart] 失败 / Failed: ${sotcCartResp.message}\norderId: ${sotcOrderId}` }], isError: true };
        }

        const sotcConfirmResp = await httpClient.request(ENDPOINTS.shopping.addCartConfirm, {
          body: { cjOrderIdList: [sotcOrderId] },
          tier: 'write',
        });
        if (!isApiSuccess(sotcConfirmResp)) {
          return { content: [{ type: 'text', text: `❌ [addCartConfirm] 失败 / Failed: ${sotcConfirmResp.message}\norderId: ${sotcOrderId}` }], isError: true };
        }
        const sotcConfirmData = sotcConfirmResp.data as Record<string, unknown>;
        const sotcShipmentsId = String(sotcConfirmData?.shipmentsId ?? '');
        if (!sotcShipmentsId) {
          return { content: [{ type: 'text', text: `❌ [addCartConfirm] shipmentsId 为空 / shipmentsId is empty\norderId: ${sotcOrderId}` }], isError: true };
        }

        const sotcParentResp = await httpClient.request(ENDPOINTS.shopping.saveGenerateParentOrder, {
          body: { shipmentOrderId: sotcShipmentsId },
          tier: 'write',
        });
        if (!isApiSuccess(sotcParentResp)) {
          return { content: [{ type: 'text', text: `❌ [saveGenerateParentOrder] 失败 / Failed: ${sotcParentResp.message}\norderId: ${sotcOrderId}, shipmentsId: ${sotcShipmentsId}` }], isError: true };
        }
        const sotcParentData = sotcParentResp.data as Record<string, unknown>;
        const sotcPayId = String(sotcParentData?.payId ?? '');
        const sotcWebBase = getEnvConfig().webBase;
        const sotcPayUrl = sotcPayId ? `${sotcWebBase}/mine/payment?pid=${sotcPayId}` : '';
        return {
          content: [{
            type: 'text',
            text: [
              `✅ 购物车提交成功！/ Cart submitted!`,
              `订单ID / Order ID: ${sotcOrderId}`,
              `Shipment ID: ${sotcShipmentsId}`,
              sotcPayUrl ? `💳 支付链接 / Payment URL: ${sotcPayUrl}` : '⚠️ payId 为空，请前往 CJ 后台查看支付',
            ].join('\n'),
          }],
        };
      }

      case 'confirm_cart_and_pay': {
        // Step3: addCartConfirm → Step4: saveGenerateParentOrder
        if (!args.orderId) {
          return { content: [{ type: 'text', text: '❌ 请提供 orderId / Please provide orderId.' }], isError: true };
        }
        const ccpOrderId = String(args.orderId);

        const ccpConfirmResp = await httpClient.request(ENDPOINTS.shopping.addCartConfirm, {
          body: { cjOrderIdList: [ccpOrderId] },
          tier: 'write',
        });
        if (!isApiSuccess(ccpConfirmResp)) {
          return { content: [{ type: 'text', text: `❌ [addCartConfirm] 失败 / Failed: ${ccpConfirmResp.message}\norderId: ${ccpOrderId}` }], isError: true };
        }
        const ccpConfirmData = ccpConfirmResp.data as Record<string, unknown>;
        const ccpShipmentsId = String(ccpConfirmData?.shipmentsId ?? '');
        if (!ccpShipmentsId) {
          return { content: [{ type: 'text', text: `❌ [addCartConfirm] shipmentsId 为空 / shipmentsId is empty\norderId: ${ccpOrderId}` }], isError: true };
        }

        const ccpParentResp = await httpClient.request(ENDPOINTS.shopping.saveGenerateParentOrder, {
          body: { shipmentOrderId: ccpShipmentsId },
          tier: 'write',
        });
        if (!isApiSuccess(ccpParentResp)) {
          return { content: [{ type: 'text', text: `❌ [saveGenerateParentOrder] 失败 / Failed: ${ccpParentResp.message}\norderId: ${ccpOrderId}, shipmentsId: ${ccpShipmentsId}` }], isError: true };
        }
        const ccpParentData = ccpParentResp.data as Record<string, unknown>;
        const ccpPayId = String(ccpParentData?.payId ?? '');
        const ccpWebBase = getEnvConfig().webBase;
        const ccpPayUrl = ccpPayId ? `${ccpWebBase}/mine/payment?pid=${ccpPayId}` : '';
        return {
          content: [{
            type: 'text',
            text: [
              `✅ 购物车已确认并生成支付单！/ Cart confirmed!`,
              `订单ID / Order ID: ${ccpOrderId}`,
              `Shipment ID: ${ccpShipmentsId}`,
              ccpPayUrl ? `💳 支付链接 / Payment URL: ${ccpPayUrl}` : '⚠️ payId 为空，请前往 CJ 后台查看支付',
            ].join('\n'),
          }],
        };
      }

      case 'generate_payment_link': {
        // Step4 only: saveGenerateParentOrder
        if (!args.shipmentsId) {
          return { content: [{ type: 'text', text: '❌ 请提供 shipmentsId / Please provide shipmentsId.' }], isError: true };
        }
        const gplShipmentsId = String(args.shipmentsId);

        const gplParentResp = await httpClient.request(ENDPOINTS.shopping.saveGenerateParentOrder, {
          body: { shipmentOrderId: gplShipmentsId },
          tier: 'write',
        });
        if (!isApiSuccess(gplParentResp)) {
          return { content: [{ type: 'text', text: `❌ [saveGenerateParentOrder] 失败 / Failed: ${gplParentResp.message}\nshipmentsId: ${gplShipmentsId}` }], isError: true };
        }
        const gplData = gplParentResp.data as Record<string, unknown>;
        const gplPayId = String(gplData?.payId ?? '');
        const gplWebBase = getEnvConfig().webBase;
        const gplPayUrl = gplPayId ? `${gplWebBase}/mine/payment?pid=${gplPayId}` : '';
        return {
          content: [{
            type: 'text',
            text: [
              `✅ 支付单生成成功！/ Payment order generated!`,
              `Shipment ID: ${gplShipmentsId}`,
              gplPayUrl ? `💳 支付链接 / Payment URL: ${gplPayUrl}` : '⚠️ payId 为空，请前往 CJ 后台查看支付',
            ].join('\n'),
          }],
        };
      }

      case 'merge_orders':
        return await callApi(ENDPOINTS.shopping.mergeOrderAutoMatch, {
        }, 'write');

      case 'get_merge_progress':
        return await callApi(ENDPOINTS.shopping.mergeOrderAutoProgress, {
          taskId: args.taskId,
        }, 'read');

      case 'get_pay_order_list':
        /**
         * @note 纠正(16次): /shopping/directOrder/getPayOrderListV3 不存在于API文档。
         * 改用 /shopping/order/list 并默认传 status=UNPAID 以过滤待支付订单。
         */
        return await callApi(ENDPOINTS.shopping.listOrder, {
          pageNum: (args.pageNum as number) || 1,
          pageSize: Math.min((args.pageSize as number) || 20, 50),
          status: 'UNPAID',
        }, 'read');

      case 'get_order_list': {
        /**
         * @note 新增(41次): 解决"查询历史订单/最近购买"等用户意图无法匹配工具的问题。
         * 使用 GET /shopping/order/list，支持状态/订单号筛选，覆盖已支付/已发货/已完成等订单。
         *
         * @note 纠正(46次): 修复 URL 前缀错误。
         * 原始代码使用 /v1 前缀，实际 OpenAPI 需要 /api2.0/v1 前缀（API_VERSION_PREFIX）。
         * 错误 URL: ${openApiBase}/v1/shopping/order/list
         * 正确 URL: ${openApiBase}/api2.0/v1/shopping/order/list
         * 同时增加 orderIds 数组参数支持（多个 id 使用重复 key: orderIds=a&orderIds=b）。
         *
         * @note 增强(66次): 新增 sortByLatest 快捷参数。
         * 当用户说「最近一笔订单」「最新订单」时，AI 传 sortByLatest=true，等同于 pageSize=1。
         * 解决低能力模型不知道如何通过 pageSize=1 获取最新订单的问题。
         *
         * @note 纠正(68次): 将裸 fetch 替换为带日志的实现，日志与 httpClient 风格一致。
         * 原始代码使用裸 fetch，导致 [HTTP] 日志缺失，用户无法在 log 中验证接口是否被调用。
         * 保留 URLSearchParams 方式以支持 orderIds 数组重复 key（httpClient params 不支持数组）。
         */
        const env = getEnvConfig();
        const urlParams = new URLSearchParams();
        // sortByLatest=true 是「最近一笔订单」快捷参数，等同于 pageSize=1
        const isSortByLatest = args.sortByLatest === true;
        urlParams.append('pageNum', String((args.pageNum as number) || 1));
        urlParams.append('pageSize', isSortByLatest ? '1' : String(Math.min((args.pageSize as number) || 10, 50)));
        if (args.status) urlParams.append('status', args.status as string);
        if (args.shipmentOrderId) urlParams.append('shipmentOrderId', args.shipmentOrderId as string);
        if (args.orderIds && Array.isArray(args.orderIds)) {
          (args.orderIds as string[]).forEach(id => urlParams.append('orderIds', id));
        }

        const listUrl = `${env.openApiBase}${API_VERSION_PREFIX}${ENDPOINTS.shopping.listOrder}?${urlParams.toString()}`;
        const endpoint = ENDPOINTS.shopping.listOrder;

        if (isDebugMode()) {
          logger.debug('HTTP', `请求参数 / Request params: GET ${endpoint}`, Object.fromEntries(urlParams));
        }

        const listStart = Date.now();
        const listResponse = await fetch(listUrl, {
          method: 'GET',
          headers: {
            'CJ-Access-Token': token,
            'Content-Type': 'application/json',
          },
        });
        const listData = await listResponse.json();
        const listDuration = Date.now() - listStart;

        logger.request('GET', listUrl, listData.code, listDuration);
        if (isDebugMode()) {
          logger.debug('HTTP', `原始响应 / Response data: ${endpoint}`, listData);
        }

        if (listData.code === 1600100 || listData.code === 401) {
          throw new AuthExpiredError('Token expired. Please re-login via the login tool. / Token已过期，请重新调用登录工具。');
        }
        if (!isApiSuccess(listData)) {
          return { content: [{ type: 'text', text: `请求失败 / Request failed: ${listData.message || JSON.stringify(listData)}` }], isError: true };
        }
        // 缓存数据，供 show_order_list UI 使用
        setOrderListCache(listData.data);
        const orderCount = listData.data?.list?.length ?? 0;
        const orderTotal = listData.data?.total ?? orderCount;

        return {
          content: [
            { type: 'text', text: JSON.stringify(listData.data, null, 2) + `\n\n✅ 已获取 ${orderCount} 条订单（共 ${orderTotal} 条）。` },
          ],
        };
      }

      case 'show_order_list': {
        const olUri = `ui://cj-mcp/order-list?t=${Date.now()}`;
        return {
          content: [{ type: 'text', text: '✅ 订单列表界面已打开 / Order list UI opened.' }],
          _meta: { ui: { resourceUri: olUri } },
        };
      }

      case 'show_order_detail': {
        const showOdId = args.orderId ? String(args.orderId) : '';
        if (!showOdId) {
          return { content: [{ type: 'text', text: '❌ orderId 必填 / orderId is required.' }], isError: true };
        }
        // 直接调用 API 获取数据并设置缓存（确保资源读取时数据已就绪）
        const odDetailResp = await httpClient.request(ENDPOINTS.shopping.getOrderDetail, {
          method: 'GET',
          params: { orderId: showOdId },
          tier: 'read',
        });
        if (isApiSuccess(odDetailResp) && odDetailResp.data) {
          setOrderDetailCache(odDetailResp.data);
        }
        const odUri = `ui://cj-mcp/order-detail?t=${Date.now()}`;
        return {
          content: [{ type: 'text', text: `✅ 订单详情界面已打开 / Order detail UI opened. orderId: ${showOdId}` }],
          _meta: { ui: { resourceUri: odUri } },
        };
      }

      case 'get_order_detail': {
        /**
         * @note 纠正(12次): 新增 get_order_detail 工具，对应 GET /shopping/order/getOrderDetail。
         * 支持 orderId（必填）和 features（可选，如 LOGISTICS_TIMELINESS）。
         * 只读操作，不涉及数据修改，无需用户二次确认。
         */
        const params: Record<string, string> = {
          orderId: String(args.orderId),
        };
        if (Array.isArray(args.features) && args.features.length > 0) {
          // API 支持多个 features 参数，这里先用逗号拼接，如需多参数形式可用 URLSearchParams
          params.features = (args.features as string[]).join(',');
        }
        const detailResponse = await httpClient.request(ENDPOINTS.shopping.getOrderDetail, {
          method: 'GET',
          params,
          tier: 'read',
        });
        if (!isApiSuccess(detailResponse)) {
          return { content: [{ type: 'text', text: `查询订单详情失败 / Get order detail failed: ${detailResponse.message}` }], isError: true };
        }
        // 缓存数据，供 show_order_detail UI 使用（必须在 show_order_detail 之前调用本工具）
        setOrderDetailCache(detailResponse.data);
        const detailOrderId = String(args.orderId);

        return {
          content: [
            { type: 'text', text: JSON.stringify(detailResponse.data, null, 2) + `\n\n✅ 订单详情已获取 orderId: "${detailOrderId}"` },
          ],
        };
      }

      case 'get_account_balance': {
        /**
         * @note 纠正(12次): 新增 get_account_balance 工具，对应 GET /shopping/pay/getBalance。
         * 返回可用余额(amount)、冻结金额(freezeAmount)、奖励金额(noWithdrawalAmount)，单位：USD。
         * 只读操作。
         */
        const balanceResponse = await httpClient.request(ENDPOINTS.shopping.getBalance, {
          method: 'GET',
          tier: 'read',
        });
        if (!isApiSuccess(balanceResponse)) {
          return { content: [{ type: 'text', text: `查询余额失败 / Get balance failed: ${balanceResponse.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(balanceResponse.data, null, 2) }] };
      }

      case 'pay_by_balance': {
        /**
         * @note 第21次提交: 新增 pay_by_balance 工具，对应 POST /shopping/pay/payBalance。
         * ⚠️ 敏感操作：余额支付单个订单，不可撤销。
         * description 强制要求 AI 先查 get_order_detail + get_account_balance，
         * 向用户展示金额并获得明确确认后，才能调用本工具。
         * sensitive-ops.ts 已注册，提供技术层确认拦截。
         */
        if (!args.orderId) {
          return { content: [{ type: 'text', text: '❌ 请提供 orderId / Please provide orderId.' }], isError: true };
        }
        const payBalResp = await httpClient.request(ENDPOINTS.shopping.payBalance, {
          body: { orderId: String(args.orderId) },
          tier: 'write',
        });
        if (!isApiSuccess(payBalResp)) {
          return {
            content: [{
              type: 'text',
              text: `❌ 余额支付失败 / Balance payment failed: ${payBalResp.message}\n订单ID / Order ID: ${args.orderId}`,
            }],
            isError: true,
          };
        }
        return {
          content: [{
            type: 'text',
            text: [
              '✅ 余额支付成功！/ Balance payment successful!',
              `订单ID / Order ID: ${args.orderId}`,
              '如需查看最新订单状态，请调用 get_order_detail。',
              'You can call get_order_detail to verify the updated order status.',
            ].join('\n'),
          }],
        };
      }

      case 'pay_by_balance_v2': {
        /**
         * @note 第21次提交: 新增 pay_by_balance_v2 工具，对应 POST /shopping/pay/payBalanceV2。
         * ⚠️ 敏感操作：余额支付母单（shipmentOrderId + payId），不可撤销。
         * description 强制要求 AI 先展示 saveGenerateParentOrder 返回的 paymentInformation，
         * 向用户展示金额并获得明确确认后，才能调用本工具。
         * sensitive-ops.ts 已注册，提供技术层确认拦截。
         */
        if (!args.shipmentOrderId || !args.payId) {
          return {
            content: [{
              type: 'text',
              text: '❌ 请提供 shipmentOrderId 和 payId / Please provide shipmentOrderId and payId.',
            }],
            isError: true,
          };
        }
        const payBalV2Resp = await httpClient.request(ENDPOINTS.shopping.payBalanceV2, {
          body: {
            shipmentOrderId: String(args.shipmentOrderId),
            payId: String(args.payId),
          },
          tier: 'write',
        });
        if (!isApiSuccess(payBalV2Resp)) {
          return {
            content: [{
              type: 'text',
              text: `❌ 母单余额支付失败 / Parent order balance payment failed: ${payBalV2Resp.message}\nShipment Order ID: ${args.shipmentOrderId}`,
            }],
            isError: true,
          };
        }
        return {
          content: [{
            type: 'text',
            text: [
              '✅ 母单余额支付成功！/ Parent order balance payment successful!',
              `Shipment Order ID: ${args.shipmentOrderId}`,
              `Pay ID: ${args.payId}`,
              '如需查看支付订单状态，请调用 get_pay_order_list。',
              'You can call get_pay_order_list to verify the updated payment status.',
            ].join('\n'),
          }],
        };
      }

      case 'confirm_order': {
        /**
         * @note 纠正(13次): 新增 confirm_order 工具，对应 PATCH /shopping/order/confirmOrder。
         * ⚠️ 敏感操作：确认订单付款，扣除账户余额，不可撤销。
         * sensitive-ops.ts 已注册，AI 调用前会看到确认提示。
         */
        if (!args.orderId) {
          return { content: [{ type: 'text', text: '❌ 请提供 orderId / Please provide orderId.' }], isError: true };
        }
        const confirmResp = await httpClient.request(ENDPOINTS.shopping.confirmOrder, {
          method: 'PATCH',
          body: { orderId: String(args.orderId) },
          tier: 'write',
        });
        if (!isApiSuccess(confirmResp)) {
          return { content: [{ type: 'text', text: `确认订单失败 / Confirm order failed: ${confirmResp.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: `✅ 订单已确认 / Order confirmed: ${JSON.stringify(confirmResp.data)}` }] };
      }

      case 'delete_order': {
        /**
         * @note 纠正(13次): 新增 delete_order 工具，对应 DELETE /shopping/order/deleteOrder?orderId=。
         * ⚠️ 敏感操作：永久删除订单，不可恢复。
         * sensitive-ops.ts 已注册，AI 调用前会看到确认提示。
         */
        if (!args.orderId) {
          return { content: [{ type: 'text', text: '❌ 请提供 orderId / Please provide orderId.' }], isError: true };
        }
        const deleteResp = await httpClient.request(ENDPOINTS.shopping.deleteOrder, {
          method: 'DELETE',
          params: { orderId: String(args.orderId) },
          tier: 'write',
        });
        if (!isApiSuccess(deleteResp)) {
          return { content: [{ type: 'text', text: `删除订单失败 / Delete order failed: ${deleteResp.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: `✅ 订单已删除 / Order deleted: ${JSON.stringify(deleteResp.data)}` }] };
      }

      case 'query_cogs': {
        /**
         * @note 新增(第15次): query_cogs，POST /shopping/order/queryCogsBasicDataOrderInfoList。
         * 查询订单采购成本明细（商品金额/运费/税费等），只读操作。
         */
        if (!Array.isArray(args.orderCodesList) || args.orderCodesList.length === 0) {
          return { content: [{ type: 'text', text: '❌ 请提供 orderCodesList 数组 / Please provide orderCodesList array.' }], isError: true };
        }
        const cogsResp = await httpClient.request(ENDPOINTS.shopping.queryCogs, {
          body: { orderCodesList: args.orderCodesList },
          tier: 'read',
        });
        if (!isApiSuccess(cogsResp)) {
          return { content: [{ type: 'text', text: `查询COGS失败 / Query COGS failed: ${cogsResp.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(cogsResp.data, null, 2) }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown order tool: ${name}` }], isError: true };
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

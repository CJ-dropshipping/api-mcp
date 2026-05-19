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
      '创建订单，从购物车或直接下单。需要收货地址和商品信息 / ' +
      'Create order from cart or direct purchase. Requires shipping address and product info.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderInfo: {
          type: 'object',
          description: '订单信息（含商品、地址、物流方式等）/ Order info (products, address, logistics)',
        },
      },
      required: ['orderInfo'],
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
      '✅【默认/通用订单查询】用户说「查订单」「查全部订单」「查所有订单」「查最近的订单」「最近订单」「历史订单」「订单状态」时必须用此工具，不要用 get_pay_order_list！\n' +
      '包含所有状态：已支付、处理中、已发货、已完成、已取消等。\n' +
      '【参数映射规则】\n' +
      '- 用户说「查订单」「查所有订单」「查全部订单」→ 无需参数，直接调用\n' +
      '- 用户说「最近的订单」「最近一笔订单」「最后一单」「最新的订单」→ sortByLatest=true, pageSize=1\n' +
      '- 用户说「查订单D1234」「订单号是XXXX」→ orderIds=["D1234"]\n' +
      '- 用户说「已发货的订单」→ status="shipped"\n' +
      '- 用户说「历史订单」「最近下单」「买了什么」→ 不传 status，按默认分页返回\n' +
      '- 用户说「已取消的」→ status="cancel"\n' +
      '\n✅ DEFAULT tool for order queries. Use for: recent orders, order history, all orders, order status.\n' +
      '[Intent mapping]\n' +
      '- "latest order" / "most recent order" / "recent orders" → sortByLatest=true, pageSize=1\n' +
      '- "order D1234" / specific order number → orderIds=["D1234"]\n' +
      '- "shipped orders" → status="shipped"\n' +
      '- "order history" / "recent purchases" → default (no status filter)',
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
      '查询单个订单的完整详情，包括商品列表、收货地址、运费、快递单号、订单状态等。\n' +
      '【意图映射】\n' +
      '- 用户说「查一下订单 D202505XXX」「订单详情」「这个订单发货了吗」→ 使用此工具\n' +
      '- 需要快递单号 → features=["LOGISTICS_TIMELINESS"]\n' +
      '- orderId 必填（支持 CJ 订单号或自定义订单号）\n' +
      'Get full details of a single order: products, address, shipping, tracking number, status.\n' +
      '[Intent mapping] "order D202505XXX detail" / "did this order ship" / "get order info" → use this tool.',
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
];


export async function handleOrderTool(
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
      case 'add_to_cart':
        return await callApi(ENDPOINTS.shopping.addCart, {
          vid: args.vid,
          quantity: (args.quantity as number) || 1,
        }, 'write');

      case 'create_order':
        return await callApi(ENDPOINTS.shopping.createOrder, args.orderInfo as Record<string, unknown>, 'write');

      case 'merge_orders':
        return await callApi(ENDPOINTS.shopping.mergeOrderAutoMatch, {
          orderIds: args.orderIds,
        }, 'write');

      case 'get_merge_progress':
        return await callApi(ENDPOINTS.shopping.mergeOrderAutoProgress, {
          taskId: args.taskId,
        }, 'read');

      case 'get_pay_order_list':
        return await callApi(ENDPOINTS.shopping.getPayOrderListV3, {
          pageNum: (args.pageNum as number) || 1,
          pageSize: Math.min((args.pageSize as number) || 20, 50),
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
        return { content: [{ type: 'text', text: JSON.stringify(listData.data, null, 2) }] };
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
        return { content: [{ type: 'text', text: JSON.stringify(detailResponse.data, null, 2) }] };
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

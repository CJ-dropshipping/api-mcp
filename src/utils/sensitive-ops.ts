/**
 * @fileoverview 敏感操作确认 + 数据隐私处理
 * - 敏感操作 (下单、创建纠纷、取消订单等) 需要人工确认
 * - 数据隐私: 用户敏感信息脱敏处理后返回
 * - 通过 MCP confirmation 机制实现人工确认
 */

/**
 * @description 需要人工确认的敏感操作列表
 * write tier 的工具 + 会产生不可逆结果的操作
 */
const SENSITIVE_TOOLS = new Set([
  'create_order',       // 创建订单 (涉及资金)
  'submit_order_to_cart', // 从 orderId 继续：加购→确认→生成支付单
  'confirm_cart_and_pay', // 从购物车内 orderId 继续：确认→生成支付单
  'generate_payment_link', // 从 shipmentsId 生成支付单
  'add_to_cart',        // 加入购物车
  'merge_orders',       // 合单 (不可逆)
  'create_dispute',     // 发起纠纷
  'cancel_dispute',     // 取消纠纷 (不可撤销)
  'logout',            // 登出 (会清除会话)
  'confirm_order',      // 确认订单付款 (涉及资金，不可撤销)
  'delete_order',       // 删除订单 (不可恢复)
  'pay_by_balance',     // 余额支付单个订单 (涉及真实资金，不可撤销)
  'pay_by_balance_v2',  // 余额支付母单 (涉及真实资金，不可撤销)
  'confirm_dispute',    // 确认纠纷处理结果 (提交后不可更改)
  'save_product_to_shop', // 保存商品到店铺（影响店铺商品数据）
  'create_product_connection', // 建立商品连接（影响订单自动匹配）
  'disconnect_product',   // 断开商品连接（可能影响现有订单匹配）
  'configure_webhook',    // 配置Webhook（影响通知推送设置）
]);

/**
 * @description 判断工具是否为敏感操作
 */
export function isSensitiveTool(toolName: string): boolean {
  return SENSITIVE_TOOLS.has(toolName);
}

/**
 * @description 生成确认提示文案
 */
export function getConfirmationPrompt(toolName: string, args: Record<string, unknown>): string {
  const descriptions: Record<string, string> = {
    create_order: '🛒 即将创建订单 / About to create an order',
    submit_order_to_cart: '🛒 即将执行：加购物车→确认购物车→生成支付单 / About to: addCart → addCartConfirm → generatePayment',
    confirm_cart_and_pay: '🛒 即将执行：确认购物车→生成支付单 / About to: addCartConfirm → generatePayment',
    generate_payment_link: '💳 即将从 shipmentsId 生成支付单（涉及资金）/ About to generate payment order from shipmentsId',
    add_to_cart: '🛒 即将添加商品到购物车 / About to add item to cart',
    merge_orders: '📦 即将执行合单操作（不可撤销）/ About to merge orders (irreversible)',
    create_dispute: '⚠️ 即将发起纠纷 / About to create a dispute',
    cancel_dispute: '⚠️ 即将取消纠纷（不可撤销）/ About to cancel dispute (irreversible)',
    logout: '🔒 即将登出当前账号 / About to logout',
    confirm_order: '💳 即将确认订单付款（涉及资金，操作不可撤销）/ About to confirm order payment (involves funds, irreversible)',
    delete_order: '🗑️ 即将删除订单（不可恢复）/ About to delete order (cannot be undone)',
    pay_by_balance: '💰 即将使用账户余额支付订单（涉及真实资金，不可撤销）\n⚠️ 请确认已知悉订单金额和账户余额再继续 / About to pay order with account balance (REAL FUNDS, IRREVERSIBLE)',
    pay_by_balance_v2: '💰 即将使用账户余额支付母单（涉及真实资金，不可撤销）\n⚠️ 请确认已知悉实付金额和账户余额再继续 / About to pay parent order with account balance (REAL FUNDS, IRREVERSIBLE)',
    confirm_dispute: '⚖️ 即将提交纠纷确认信息（提交后不可更改）/ About to submit dispute confirmation (cannot be changed after submission)',
    save_product_to_shop: '🏪 即将保存商品到CJ店铺系统（将修改店铺商品数据）/ About to save product to CJ store system (modifies store product data)',
    create_product_connection: '🔗 即将创建商品连接（将CJ商品与平台商品绑定，影响订单自动匹配）/ About to create product connection (binds CJ product to platform product)',
    disconnect_product: '✂️ 即将断开商品连接（移除平台商品与CJ商品的绑定，可能影响现有订单自动匹配）/ About to disconnect product (removes binding, may affect order matching)',
    configure_webhook: '🔔 即将修改Webhook通知设置（将影响所有事件通知的推送目标URL）/ About to configure webhook settings (affects all event notification URLs)',
  };

  const desc = descriptions[toolName] || `⚠️ 即将执行: ${toolName}`;
  const safeArgs = sanitizeForDisplay(args);

  return `${desc}\n\n` +
    `📋 参数 / Parameters:\n${JSON.stringify(safeArgs, null, 2)}\n\n` +
    `请确认是否继续 / Please confirm to proceed.`;
}

/**
 * @description 脱敏显示参数 (隐藏敏感字段值)
 */
function sanitizeForDisplay(args: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'token', 'apiKey', 'cardNumber', 'cvv'];
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(args)) {
    if (sensitiveFields.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
      result[key] = '***[已隐藏/hidden]***';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = Array.isArray(value) ? `[Array(${value.length})]` : sanitizeForDisplay(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * @description 用户数据隐私处理
 * 对外输出时隐藏用户敏感信息
 */
export function maskUserData(data: Record<string, unknown>): Record<string, unknown> {
  const masked: Record<string, unknown> = { ...data };
  const privacyFields: Record<string, (v: string) => string> = {
    email: (v) => v.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
    phone: (v) => v.replace(/(.{3})(.*)(.{4})/, '$1****$3'),
    address: () => '***[已隐藏]***',
    idCard: (v) => v.replace(/(.{4})(.*)(.{4})/, '$1****$3'),
    bankAccount: (v) => v.replace(/(.{4})(.*)(.{4})/, '$1****$3'),
  };

  for (const [key, maskFn] of Object.entries(privacyFields)) {
    if (masked[key] && typeof masked[key] === 'string') {
      masked[key] = maskFn(masked[key] as string);
    }
  }
  return masked;
}

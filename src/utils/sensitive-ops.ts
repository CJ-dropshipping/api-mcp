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
  'add_to_cart',        // 加入购物车
  'merge_orders',       // 合单 (不可逆)
  'create_dispute',     // 发起纠纷
  'cancel_dispute',     // 取消纠纷 (不可撤销)
  'logout',            // 登出 (会清除会话)
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
    add_to_cart: '🛒 即将添加商品到购物车 / About to add item to cart',
    merge_orders: '📦 即将执行合单操作（不可撤销）/ About to merge orders (irreversible)',
    create_dispute: '⚠️ 即将发起纠纷 / About to create a dispute',
    cancel_dispute: '⚠️ 即将取消纠纷（不可撤销）/ About to cancel dispute (irreversible)',
    logout: '🔒 即将登出当前账号 / About to logout',
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

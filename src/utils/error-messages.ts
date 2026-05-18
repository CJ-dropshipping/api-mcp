/**
 * @fileoverview 友好错误信息 + 帮助文档
 * - 统一的错误码映射和用户友好提示
 * - 包含操作指引和帮助链接
 * - 中英文双语
 */

export interface FriendlyError {
  code: string;
  message: string;
  suggestion: string;
  helpUrl?: string;
}

/**
 * @description 错误分类
 */
export const ERROR_CODES = {
  // 认证相关
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_ACCOUNT_LOCKED: 'AUTH_ACCOUNT_LOCKED',
  AUTH_NO_APIKEY: 'AUTH_NO_APIKEY',

  // 限流相关
  RATE_LIMIT_QPS: 'RATE_LIMIT_QPS',
  RATE_LIMIT_DAILY: 'RATE_LIMIT_DAILY',
  RATE_LIMIT_CONCURRENCY: 'RATE_LIMIT_CONCURRENCY',

  // 请求相关
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  INVALID_PARAMS: 'INVALID_PARAMS',

  // 业务相关
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  ORDER_FAILED: 'ORDER_FAILED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',

  // 权限相关
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  SENSITIVE_OP_REJECTED: 'SENSITIVE_OP_REJECTED',
} as const;

const ERROR_MESSAGES: Record<string, FriendlyError> = {
  [ERROR_CODES.AUTH_REQUIRED]: {
    code: ERROR_CODES.AUTH_REQUIRED,
    message: '❌ 请先登录 / Please login first',
    suggestion: '使用 show_login_form 工具打开登录页面，或使用 verify_credentials 工具直接登录。\n' +
      'Use show_login_form to open login page, or verify_credentials to login directly.',
    helpUrl: 'https://developers.cjdropshipping.com/api2.0/guide/getstarted.html',
  },
  [ERROR_CODES.AUTH_EXPIRED]: {
    code: ERROR_CODES.AUTH_EXPIRED,
    message: '⚠️ 登录已过期 / Session expired',
    suggestion: '请重新登录。如频繁过期，请检查 apiKey 是否有效。\n' +
      'Please re-login. If expires frequently, check if your apiKey is still valid.',
    helpUrl: 'https://developers.cjdropshipping.com/api2.0/guide/getstarted.html',
  },
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: {
    code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
    message: '❌ 账号或密码错误 / Incorrect credentials',
    suggestion: '请检查邮箱和密码是否正确。如忘记密码请到 CJ 官网重置。\n' +
      'Check your email and password. Reset at CJ website if forgotten.',
  },
  [ERROR_CODES.AUTH_ACCOUNT_LOCKED]: {
    code: ERROR_CODES.AUTH_ACCOUNT_LOCKED,
    message: '🔒 账号已被锁定 / Account locked',
    suggestion: '请联系 CJ 客服解锁账号。\n' +
      'Please contact CJ support to unlock your account.',
  },
  [ERROR_CODES.AUTH_NO_APIKEY]: {
    code: ERROR_CODES.AUTH_NO_APIKEY,
    message: '⚠️ 未找到 API Key / No API Key found',
    suggestion: '请到 CJ 后台生成 API Key:\n' +
      '测试环境: http://www.cjdropshipping.offline.pre.com/myCJ.html#/apikey\n' +
      '线上环境: https://www.cjdropshipping.com/myCJ.html#/apikey\n' +
      'Please generate an API Key at CJ dashboard.',
  },
  [ERROR_CODES.RATE_LIMIT_QPS]: {
    code: ERROR_CODES.RATE_LIMIT_QPS,
    message: '🚦 请求过于频繁 / Too many requests',
    suggestion: '请稍等几秒后重试。当前请求已进入队列，系统会自动延迟重试。\n' +
      'Please wait a few seconds. Request is queued for automatic retry.',
  },
  [ERROR_CODES.RATE_LIMIT_DAILY]: {
    code: ERROR_CODES.RATE_LIMIT_DAILY,
    message: '📅 今日配额已用完 / Daily quota exceeded',
    suggestion: '今日 API 调用次数已达上限 (10000次)，请明日再试或联系管理员提升配额。\n' +
      'Daily API call limit (10000) reached. Try again tomorrow or contact admin.',
  },
  [ERROR_CODES.RATE_LIMIT_CONCURRENCY]: {
    code: ERROR_CODES.RATE_LIMIT_CONCURRENCY,
    message: '⏳ 并发请求过多 / Too many concurrent requests',
    suggestion: '当前同时执行的操作较多，请等待前面操作完成。\n' +
      'Too many operations running. Please wait for previous ones to complete.',
  },
  [ERROR_CODES.NETWORK_ERROR]: {
    code: ERROR_CODES.NETWORK_ERROR,
    message: '🌐 网络连接失败 / Network error',
    suggestion: '请检查网络连接，确认 CJ API 服务可访问。\n' +
      'Check your network connection and CJ API accessibility.',
  },
  [ERROR_CODES.TIMEOUT]: {
    code: ERROR_CODES.TIMEOUT,
    message: '⏱️ 请求超时 / Request timeout',
    suggestion: '请求未在规定时间内完成，请稍后重试。\n' +
      'Request timed out. Please try again later.',
  },
  [ERROR_CODES.SERVER_ERROR]: {
    code: ERROR_CODES.SERVER_ERROR,
    message: '🔧 服务器内部错误 / Server error',
    suggestion: '服务端暂时异常，请稍后重试。如持续出现请联系技术支持。\n' +
      'Server temporarily unavailable. Try again later or contact support.',
  },
  [ERROR_CODES.INVALID_PARAMS]: {
    code: ERROR_CODES.INVALID_PARAMS,
    message: '📋 参数错误 / Invalid parameters',
    suggestion: '请检查输入参数是否正确和完整。\n' +
      'Please check if your input parameters are correct and complete.',
  },
  [ERROR_CODES.PERMISSION_DENIED]: {
    code: ERROR_CODES.PERMISSION_DENIED,
    message: '🚫 无权限 / Permission denied',
    suggestion: '当前账号无权执行此操作，请检查账号权限。\n' +
      'Current account lacks permission. Check account privileges.',
  },
  [ERROR_CODES.SENSITIVE_OP_REJECTED]: {
    code: ERROR_CODES.SENSITIVE_OP_REJECTED,
    message: '🛡️ 敏感操作被拒绝 / Sensitive operation rejected',
    suggestion: '该操作需要人工确认后才能执行。请在提示后确认。\n' +
      'This operation requires manual confirmation. Please confirm when prompted.',
  },
};

/**
 * @description 获取友好错误信息
 */
export function getFriendlyError(code: string): FriendlyError {
  return ERROR_MESSAGES[code] || {
    code,
    message: `未知错误 / Unknown error (${code})`,
    suggestion: '请稍后重试或联系技术支持。\n Try again later or contact support.',
  };
}

/**
 * @description 根据 HTTP 状态码或 API code 映射错误
 */
export function mapApiError(apiCode: number, apiMessage?: string): FriendlyError {
  switch (apiCode) {
    case 1600100:
    case 401:
      return getFriendlyError(ERROR_CODES.AUTH_EXPIRED);
    case 300006:
      return getFriendlyError(ERROR_CODES.AUTH_INVALID_CREDENTIALS);
    case 300003:
      return { ...getFriendlyError(ERROR_CODES.AUTH_INVALID_CREDENTIALS), message: '❌ 该邮箱未注册 / Email not registered' };
    case 300001:
      return getFriendlyError(ERROR_CODES.AUTH_ACCOUNT_LOCKED);
    case 429:
      return getFriendlyError(ERROR_CODES.RATE_LIMIT_QPS);
    case 500:
    case 502:
    case 503:
      return getFriendlyError(ERROR_CODES.SERVER_ERROR);
    default:
      if (apiCode >= 400 && apiCode < 500) {
        return { ...getFriendlyError(ERROR_CODES.INVALID_PARAMS), message: apiMessage || '请求错误 / Bad request' };
      }
      return {
        code: `API_${apiCode}`,
        message: apiMessage || `API错误 (code: ${apiCode})`,
        suggestion: '请稍后重试。\n Please try again later.',
      };
  }
}

/**
 * @description 帮助文档链接集合
 */
export const HELP_DOCS = {
  quickStart: 'https://developers.cjdropshipping.com/api2.0/guide/getstarted.html',
  authentication: 'https://developers.cjdropshipping.com/api2.0/guide/authentication.html',
  productApi: 'https://developers.cjdropshipping.com/api2.0/guide/product.html',
  orderApi: 'https://developers.cjdropshipping.com/api2.0/guide/order.html',
  rateLimit: 'https://developers.cjdropshipping.com/api2.0/guide/rate-limit.html',
};

/**
 * @description 格式化工具响应 (带帮助信息)
 */
export function formatToolError(errorCode: string, extraDetail?: string): {
  content: Array<{ type: string; text: string }>;
  isError: boolean;
} {
  const err = getFriendlyError(errorCode);
  let text = `${err.message}\n\n💡 ${err.suggestion}`;
  if (extraDetail) text += `\n\n📝 详情 / Detail: ${extraDetail}`;
  if (err.helpUrl) text += `\n\n📖 帮助文档 / Help: ${err.helpUrl}`;
  return { content: [{ type: 'text', text }], isError: true };
}

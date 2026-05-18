/**
 * @fileoverview MCP 日志系统
 * - 日志脱敏：自动隐藏密码、token、apiKey 等敏感信息
 * - 限流日志：记录 QPS 限速事件
 * - 健康检查：提供系统状态概览
 * - 输出到 stderr (MCP Server 的 stdout 用于 JSON-RPC 通信)
 * @note 新增(62次): 支持写入日志文件（logs/mcp-YYYY-MM-DD.log），通过 CJ_LOG_FILE=true 开启
 * @note 修复(65次): 用 __dirname 替代 process.cwd() 定位 logs 目录
 *   原因: stdio 模式由 VS Code 启动时，process.cwd() 是 VS Code 工作目录（不固定），
 *         导致日志写入位置不确定；__dirname 是打包后 dist/mcp-server/ 目录，
 *         join(__dirname, '../../logs') 始终指向项目根 CJMCPAPP/logs/
 */
import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** 当前日志级别，通过环境变量配置 */
const currentLevel: LogLevel = (process.env.CJ_LOG_LEVEL as LogLevel) || 'info';

/**
 * @description 敏感字段脱敏规则
 * @note 注意: 日志中不得暴露用户密码、token、apiKey 等信息
 * 脱敏策略: 保留前4位+后4位，中间用***替代
 */
const SENSITIVE_KEYS = ['password', 'token', 'apiKey', 'accessToken', 'refreshToken', 'cjLoginToken', 'fingerToken', 'csrfToken', 'cookie', 'Cookie'];

function maskValue(value: string): string {
  if (!value || value.length <= 8) return '****';
  return value.slice(0, 4) + '***' + value.slice(-4);
}

/**
 * @description 递归脱敏对象中的敏感字段
 */
function sanitize(obj: unknown, depth = 0): unknown {
  if (depth > 5) return '[深层嵌套已省略]';
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
      sanitized[key] = typeof value === 'string' ? maskValue(value) : '****';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function formatMessage(level: LogLevel, category: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}] [${category}]`;
  let line = `${prefix} ${message}`;
  if (data !== undefined) {
    const sanitized = sanitize(data);
    line += ` ${JSON.stringify(sanitized)}`;
  }
  return line;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

/**
 * @note 新增(63次): 供外部模块判断是否处于详细日志模式
 * 当 CJ_LOG_LEVEL=debug 时为 true，用于控制是否输出参数值/响应体等大量内容
 */
export function isDebugMode(): boolean {
  return shouldLog('debug');
}

/**
 * @note 新增(62次): 文件日志写入
 * 通过环境变量 CJ_LOG_FILE=true 开启，日志文件存放在 logs/mcp-YYYY-MM-DD.log
 * 日志文件跟时间挂钩，每天一个新文件
 * @note 修复(65次): 使用 __dirname 计算项目根目录（固定为 CJMCPAPP/logs/），
 *   不再依赖 process.cwd()，解决 stdio 模式下日志写入位置不确定的问题
 */
const LOG_TO_FILE = process.env.CJ_LOG_FILE === 'true';
let logDir: string | null = null;

function writeToFile(line: string): void {
  if (!LOG_TO_FILE) return;
  try {
    if (!logDir) {
      // __dirname 在打包后为 dist/mcp-server/，../../ 指向项目根 CJMCPAPP/
      logDir = join(__dirname, '../../logs');
      mkdirSync(logDir, { recursive: true });
    }
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const logFile = join(logDir, `mcp-${date}.log`);
    appendFileSync(logFile, line + '\n', 'utf-8');
  } catch {
    // 文件写入失败不影响主流程
  }
}

function emit(line: string): void {
  process.stderr.write(line + '\n');
  writeToFile(line);
}

export const logger = {
  debug(category: string, message: string, data?: unknown): void {
    if (shouldLog('debug')) {
      emit(formatMessage('debug', category, message, data));
    }
  },

  info(category: string, message: string, data?: unknown): void {
    if (shouldLog('info')) {
      emit(formatMessage('info', category, message, data));
    }
  },

  warn(category: string, message: string, data?: unknown): void {
    if (shouldLog('warn')) {
      emit(formatMessage('warn', category, message, data));
    }
  },

  error(category: string, message: string, data?: unknown): void {
    if (shouldLog('error')) {
      emit(formatMessage('error', category, message, data));
    }
  },

  /** 限流事件专用日志 */
  rateLimit(tier: string, action: 'queued' | 'retrying' | 'exceeded', detail?: string): void {
    const message = `[RateLimit] tier=${tier} action=${action}${detail ? ' ' + detail : ''}`;
    if (action === 'exceeded') {
      this.warn('RATE_LIMIT', message);
    } else {
      this.info('RATE_LIMIT', message);
    }
  },

  /** 请求日志 (脱敏) */
  request(method: string, url: string, statusCode?: number, durationMs?: number): void {
    // 隐藏 URL 中的 token 参数
    const safeUrl = url.replace(/([?&])(token|apiKey|accessToken)=[^&]*/gi, '$1$2=***');
    this.info('HTTP', `${method} ${safeUrl} → ${statusCode ?? '?'} (${durationMs ?? '?'}ms)`);
  },

  /**
   * @note 新增(62次): 原始行输出，同时写入终端和文件
   * 用于 [MCP-REQ] 这类格式不走标准 category 的日志
   */
  raw(line: string): void {
    emit(line);
  },
};

/**
 * @description 健康检查状态
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: string;
  checks: {
    rateLimit: { status: string; detail: unknown };
    session: { status: string; detail: string };
  };
}

const startTime = Date.now();

export function getHealthStatus(sessionValid: boolean, rateLimitStatus: unknown): HealthStatus {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const rlOk = true; // rate limiter 是纯内存的，始终 available
  const overall = sessionValid && rlOk ? 'healthy' : (!sessionValid ? 'degraded' : 'unhealthy');

  return {
    status: overall,
    uptime,
    timestamp: new Date().toISOString(),
    checks: {
      rateLimit: { status: 'ok', detail: rateLimitStatus },
      session: { status: sessionValid ? 'valid' : 'expired', detail: sessionValid ? '会话有效' : '需要重新登录' },
    },
  };
}

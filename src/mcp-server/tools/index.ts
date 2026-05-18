/**
 * @fileoverview Tools 注册中心
 * 统一管理所有 MCP Tools 的注册和调度
 * - 集成日志脱敏
 * - 集成并发控制
 * - 集成敏感操作确认
 * - 集成友好错误提示
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { authTools, getAuthTools, handleAuthTool } from './auth.tool.js';
import { productTools, handleProductTool } from './product.tool.js';
import { logisticsTools, handleLogisticsTool } from './logistics.tool.js';
import { navigateTools, handleNavigateTool } from './navigate.tool.js';
import { orderTools, handleOrderTool } from './order.tool.js';
import { disputeTools, handleDisputeTool } from './dispute.tool.js';
import { shopTools, handleShopTool } from './shop.tool.js';
import { stockTools, handleStockTool } from './stock.tool.js';
import { logger, isDebugMode } from '../../utils/logger.js';
import { rateLimiter, QuotaExceededError } from '../../api-client/rate-limiter.js';
import { isSensitiveTool, getConfirmationPrompt } from '../../utils/sensitive-ops.js';
import { formatToolError, ERROR_CODES } from '../../utils/error-messages.js';
import { AuthExpiredError } from '../../api-client/http-client.js';

interface ToolCallResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

type ToolHandler = (name: string, args: Record<string, unknown>) => Promise<ToolCallResult>;

const toolRegistry: Map<string, ToolHandler> = new Map();
/** 非认证域的静态工具列表（不变） */
let staticTools: Tool[] = [];

export function registerTools(): void {
  // 认证域
  for (const tool of authTools) {
    toolRegistry.set(tool.name, handleAuthTool);
  }
  // 商品域
  for (const tool of productTools) {
    toolRegistry.set(tool.name, handleProductTool);
  }
  // 物流域
  for (const tool of logisticsTools) {
    toolRegistry.set(tool.name, handleLogisticsTool);
  }
  // 订单/购物车域
  for (const tool of orderTools) {
    toolRegistry.set(tool.name, handleOrderTool);
  }
  // 纠纷域
  for (const tool of disputeTools) {
    toolRegistry.set(tool.name, handleDisputeTool);
  }
  // 店铺域
  for (const tool of shopTools) {
    toolRegistry.set(tool.name, handleShopTool);
  }
  // 库存域
  for (const tool of stockTools) {
    toolRegistry.set(tool.name, handleStockTool);
  }
  // 导航域
  for (const tool of navigateTools) {
    toolRegistry.set(tool.name, handleNavigateTool);
  }

  // @note 新增(64次): 静态工具列表不含 auth（auth 由 getAuthTools() 动态返回）
  staticTools = [
    ...productTools, ...logisticsTools,
    ...orderTools, ...disputeTools,
    ...shopTools, ...stockTools, ...navigateTools,
  ];
}

export function getToolsList(): Tool[] {
  // @note 新增(64次): getAuthTools() 每次调用都动态返回认证工具列表
  // 当 waitForLoginInProgress=true 时， wait_for_login 不含 _meta.ui.resourceUri，防止客户端再次弹窗
  return [...getAuthTools(), ...staticTools];
}

export async function handleToolCall(name: string, args: Record<string, unknown>): Promise<ToolCallResult> {
  const handler = toolRegistry.get(name);
  if (!handler) {
    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true,
    };
  }

  const startTime = Date.now();
  // @note 更新(62次): 显示参数 key 列表，方便排查调用问题
  logger.info('TOOL', `调用 / Calling: ${name}`, { args: Object.keys(args) });
  // @note 新增(63次): debug 模式下输出完整参数值（自动脱敏密码/token 等敏感字段）
  if (isDebugMode()) {
    logger.debug('TOOL', `调用参数详情 / Args detail: ${name}`, args);
  }

  // 敏感操作确认检查
  if (isSensitiveTool(name)) {
    const confirmPrompt = getConfirmationPrompt(name, args);
    logger.info('SENSITIVE', `敏感操作需确认 / Sensitive operation requires confirmation: ${name}`);
    // 返回确认提示，MCP客户端会展示给用户
    // 注意: 实际确认机制依赖 MCP 客户端实现 (Claude Desktop 会自动提示)
    // 这里记录日志并继续执行（MCP协议本身会处理确认流程）
    logger.debug('SENSITIVE', confirmPrompt);
  }

  // 并发控制
  await rateLimiter.acquireConcurrency();

  try {
    const result = await handler(name, args);
    const duration = Date.now() - startTime;
    // @note 更新(62次): 显示结果摘要（第一条 content 前80字），方便查看接口返回
    const resultSummary = result.content?.[0]?.text?.slice(0, 80).replace(/\n/g, ' ') ?? '';
    logger.info('TOOL', `完成 / Done: ${name} (${duration}ms)`, { isError: result.isError || false, result: resultSummary });
    // @note 新增(63次): debug 模式下输出完整结果（所有 content 条目）
    if (isDebugMode()) {
      logger.debug('TOOL', `完成详情 / Done detail: ${name}`, {
        isError: result.isError || false,
        content: result.content,
      });
    }
    return result;
  } catch (error: unknown) {
    const duration = Date.now() - startTime;

    if (error instanceof QuotaExceededError) {
      logger.rateLimit('daily', 'exceeded', error.message);
      return formatToolError(ERROR_CODES.RATE_LIMIT_DAILY);
    }

    if (error instanceof AuthExpiredError) {
      logger.warn('AUTH', `Token过期 / Token expired during ${name}`);
      return formatToolError(ERROR_CODES.AUTH_EXPIRED);
    }

    const message = error instanceof Error ? error.message : String(error);
    logger.error('TOOL', `异常 / Error: ${name} (${duration}ms)`, { error: message });

    // 网络错误特殊处理
    if (message.includes('fetch') || message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT')) {
      return formatToolError(ERROR_CODES.NETWORK_ERROR, message);
    }

    return {
      content: [{ type: 'text', text: `❌ 操作失败 / Operation failed: ${message}\n\n💡 请稍后重试，或使用 check_login_status 确认登录状态。\nPlease try again later, or use check_login_status to verify your session.` }],
      isError: true,
    };
  } finally {
    rateLimiter.releaseConcurrency();
  }
}

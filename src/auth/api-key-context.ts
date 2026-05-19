/**
 * @fileoverview URL 请求上下文（AsyncLocalStorage）
 *
 * 支持两种 URL 认证模式：
 *
 * 1. **apiKey 模式**（`/mcp/{apiKey}`）：
 *    HTTP 入口将 apiKey 注入 `apiKeyStorage`，session.ts 据此路由到 `apiKeySessions Map`。
 *
 * 2. **直接 Token 模式**（`/mcp/API@{userId}@CJ:{accessToken}`）：
 *    HTTP 入口将 { userId, accessToken } 注入 `directTokenStorage`，
 *    session.ts 据此直接返回合成 session，完全无服务端内存存储（stateless）。
 *    accessToken 过期后需用户更新 ChatGPT 应用 URL。
 */
import { AsyncLocalStorage } from 'node:async_hooks';

export const apiKeyStorage = new AsyncLocalStorage<string>();

/**
 * 获取当前异步上下文中的 apiKey（从 /mcp/{apiKey} 路径注入）。
 * 若当前不在 /mcp/{apiKey} 请求上下文中，则返回 undefined。
 */
export function getContextApiKey(): string | undefined {
  return apiKeyStorage.getStore();
}

/**
 * 直接 Token 模式的上下文数据。
 * URL 格式：/mcp/API@{userId}@CJ:{accessToken}
 */
export interface DirectTokenContext {
  /** 用户标识（从 URL 中 API@{userId} 部分提取，如 CJ4623764） */
  userId: string;
  /** 直接从 URL 提取的 accessToken，用于 API 调用，不写入服务端存储 */
  accessToken: string;
}

export const directTokenStorage = new AsyncLocalStorage<DirectTokenContext>();

/**
 * 获取当前异步上下文中的直接 Token 上下文（从 /mcp/API@userId@CJ:token 路径注入）。
 * 若当前不在直接 Token 请求上下文中，则返回 undefined。
 */
export function getDirectTokenContext(): DirectTokenContext | undefined {
  return directTokenStorage.getStore();
}

import { describe, expect, it } from 'vitest';
import {
  MCP_CORS_ALLOWED_HEADERS,
  MCP_TRANSPORT_OPTIONS,
} from '../../src/mcp-server/transport-config.js';

describe('MCP HTTP transport contract', () => {
  it('POST 请求使用 JSON 响应模式', () => {
    expect(MCP_TRANSPORT_OPTIONS.enableJsonResponse).toBe(true);
    expect(MCP_TRANSPORT_OPTIONS.sessionIdGenerator).toBeUndefined();
  });

  it('CORS 允许 MCP 协议版本和会话请求头', () => {
    expect(MCP_CORS_ALLOWED_HEADERS).toContain('MCP-Protocol-Version');
    expect(MCP_CORS_ALLOWED_HEADERS).toContain('mcp-session-id');
  });
});

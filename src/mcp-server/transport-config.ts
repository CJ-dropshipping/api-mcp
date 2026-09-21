export const MCP_TRANSPORT_OPTIONS = {
  sessionIdGenerator: undefined,
  enableJsonResponse: true,
} as const;

export const MCP_CORS_ALLOWED_HEADERS = [
  'Content-Type',
  'Accept',
  'MCP-Protocol-Version',
  'mcp-session-id',
  'Last-Event-ID',
].join(', ');

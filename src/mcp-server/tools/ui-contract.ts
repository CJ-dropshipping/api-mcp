/** MCP Apps tool contract shared by the product and order UI tools. */
export const MCP_UI_OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: true,
} as const;

export function buildUiToolMeta(resourceUri: string): Record<string, unknown> {
  return {
    ui: { resourceUri },
    // ChatGPT compatibility alias for the standard MCP Apps resource URI.
    'openai/outputTemplate': resourceUri,
  };
}

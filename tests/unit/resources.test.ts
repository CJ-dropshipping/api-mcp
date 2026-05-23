import { describe, expect, it } from 'vitest';
import {
  MCP_APP_HTML_MIME,
  getResourcesList,
  handleResourceRead,
} from '../../src/mcp-server/resources/index.js';

describe('MCP UI resources', () => {
  it('resources/list 使用 MCP Apps 标准 mimeType', () => {
    const resources = getResourcesList();
    expect(resources.length).toBeGreaterThan(0);
    for (const resource of resources) {
      expect(resource.mimeType).toBe(MCP_APP_HTML_MIME);
    }
  });

  it('resources/read 返回 MCP Apps 标准 mimeType', async () => {
    const uri = 'ui://cj-mcp/login?t=123';
    const result = await handleResourceRead(uri);
    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].mimeType).toBe(MCP_APP_HTML_MIME);
    expect(result.contents[0].text).toContain('<!DOCTYPE html>');
  });
});

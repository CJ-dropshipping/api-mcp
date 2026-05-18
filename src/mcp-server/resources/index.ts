/**
 * @fileoverview Resources 注册中心
 * 管理 MCP UI Resources (如登录页面)
 * @note CJS 兼容: 使用 __dirname 替代 import.meta.url，esbuild bundle 为 CJS 时 import.meta 为空
 */
import { readFileSync } from 'fs';
import { join } from 'path';

interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

interface ResourceContent {
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}

const resources: Resource[] = [
  {
    uri: 'ui://cj-mcp/login',
    name: 'CJ Login Form',
    description: 'Interactive login form for CJ Dropshipping / CJ登录页面',
    mimeType: 'text/html',
  },
];

export function registerResources(): void {
  // Resources are statically defined
}

export function getResourcesList(): Resource[] {
  return resources;
}

export function handleResourceRead(uri: string): ResourceContent {
  /**
   * @note 纠正(72次): 改用前缀匹配替代精确匹配。
   * 原因：getAuthTools() 现在为 wait_for_login 注入唯一时间戳 URI（如 ui://cj-mcp/login?t=1716123456789），
   * 确保 VS Code Copilot 每次在当前对话位置创建新登录 UI，而不是复用旧的 UI 元素。
   * 服务端读取时，只需识别基础路径 'ui://cj-mcp/login' 前缀即可，查询参数仅用于客户端唯一性标识。
   */
  if (uri.startsWith('ui://cj-mcp/login')) {
    // 从 dist/mcp-server/ 或 src/mcp-server/resources/ 相对定位到 src/ui/login.html
    // 构建后运行时: dist/mcp-server/index.cjs → 需要 ../../src/ui/login.html
    // 开发时(tsx): src/mcp-server/resources/index.ts → 需要 ../../ui/login.html
    const possiblePaths = [
      join(process.cwd(), 'src', 'ui', 'login.html'),
      join(__dirname, '..', '..', 'ui', 'login.html'),
    ];

    for (const htmlPath of possiblePaths) {
      try {
        const htmlContent = readFileSync(htmlPath, 'utf-8');
        return {
          contents: [{ uri, mimeType: 'text/html', text: htmlContent }],
        };
      } catch {
        continue;
      }
    }

    throw new Error('Login HTML not found. Ensure src/ui/login.html exists.');
  }

  throw new Error(`Unknown resource: ${uri}`);
}

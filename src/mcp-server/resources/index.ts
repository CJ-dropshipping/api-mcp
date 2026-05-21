/**
 * @fileoverview Resources 注册中心
 * 管理 MCP UI Resources (如登录页面)
 * @note CJS 兼容: 使用 __dirname 替代 import.meta.url，esbuild bundle 为 CJS 时 import.meta 为空
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../../utils/logger.js';

interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

interface ResourceContent {
  contents: Array<{ uri: string; mimeType: string; text: string }>;
}

/** 模块级缓存：存储最近一次 search_products / get_product_detail 的数据，用于注入 UI 初始数据 */
let cachedProductListData: unknown = null;
let cachedProductDetailData: unknown = null;
let cachedOrderListData: unknown = null;
let cachedOrderDetailData: unknown = null;

export function setProductListCache(data: unknown): void {
  cachedProductListData = data;
}

export function setProductDetailCache(data: unknown): void {
  cachedProductDetailData = data;
}

export function hasProductDetailCache(): boolean {
  return cachedProductDetailData != null;
}

export function setOrderListCache(data: unknown): void {
  cachedOrderListData = data;
}

export function setOrderDetailCache(data: unknown): void {
  cachedOrderDetailData = data;
}

const resources: Resource[] = [
  {
    uri: 'ui://cj-mcp/login',
    name: 'CJ Login Form',
    description: 'Interactive login form for CJ Dropshipping / CJ登录页面',
    mimeType: 'text/html',
  },
  {
    uri: 'ui://cj-mcp/product-list',
    name: 'CJ Product List',
    description: 'Interactive product list viewer. Use this to display search_products results in a visual card layout. / 商品列表展示页面，用于以卡片方式可视化展示商品搜索结果。',
    mimeType: 'text/html',
  },
  {
    uri: 'ui://cj-mcp/product-detail',
    name: 'CJ Product Detail',
    description: 'Interactive product detail viewer. Use this to display get_product_detail results with images, variants, and pricing. / 商品详情展示页面，用于展示商品图片、规格和价格信息。',
    mimeType: 'text/html',
  },
  {
    uri: 'ui://cj-mcp/order-list',
    name: 'CJ Order List',
    description: 'Visual order list viewer. Displays order status, amounts, logistics and shipping info. / 订单列表展示页面，以卡片方式展示订单状态、金额、物流等信息。',
    mimeType: 'text/html',
  },
  {
    uri: 'ui://cj-mcp/order-detail',
    name: 'CJ Order Detail',
    description: 'Visual order detail viewer. Displays full order info: status, address, product list, logistics, amounts. / 订单详情展示页面，展示订单状态、收货地址、商品清单、物流信息等完整详情。',
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

  if (uri.startsWith('ui://cj-mcp/product-list')) {
    logger.debug(`[RESOURCE] product-list requested, cache=${cachedProductListData != null ? 'HIT' : 'MISS'}`);
    const possiblePaths = [
      join(process.cwd(), 'src', 'ui', 'product-list.html'),
      join(__dirname, '..', '..', 'ui', 'product-list.html'),
    ];
    for (const htmlPath of possiblePaths) {
      try {
        let htmlContent = readFileSync(htmlPath, 'utf-8');
        // 注入初始数据
        if (cachedProductListData) {
          const initScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(cachedProductListData)};</script>`;
          htmlContent = htmlContent.replace('</head>', `${initScript}\n</head>`);
        }
        return { contents: [{ uri, mimeType: 'text/html', text: htmlContent }] };
      } catch { continue; }
    }
    throw new Error('product-list.html not found. Ensure src/ui/product-list.html exists.');
  }

  if (uri.startsWith('ui://cj-mcp/product-detail')) {
    logger.debug(`[RESOURCE] product-detail requested, cache=${cachedProductDetailData != null ? 'HIT' : 'MISS'}`);
    const possiblePaths = [
      join(process.cwd(), 'src', 'ui', 'product-detail.html'),
      join(__dirname, '..', '..', 'ui', 'product-detail.html'),
    ];
    for (const htmlPath of possiblePaths) {
      try {
        let htmlContent = readFileSync(htmlPath, 'utf-8');
        // 注入初始数据
        if (cachedProductDetailData) {
          const initScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(cachedProductDetailData)};</script>`;
          htmlContent = htmlContent.replace('</head>', `${initScript}\n</head>`);
        }
        return { contents: [{ uri, mimeType: 'text/html', text: htmlContent }] };
      } catch { continue; }
    }
    throw new Error('product-detail.html not found. Ensure src/ui/product-detail.html exists.');
  }

  if (uri.startsWith('ui://cj-mcp/order-detail')) {
    logger.debug(`[RESOURCE] order-detail requested, cache=${cachedOrderDetailData != null ? 'HIT' : 'MISS'}`);
    const possiblePaths = [
      join(process.cwd(), 'src', 'ui', 'order-detail.html'),
      join(__dirname, '..', '..', 'ui', 'order-detail.html'),
    ];
    for (const htmlPath of possiblePaths) {
      try {
        let htmlContent = readFileSync(htmlPath, 'utf-8');
        if (cachedOrderDetailData) {
          const initScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(cachedOrderDetailData)};</script>`;
          htmlContent = htmlContent.replace('</head>', `${initScript}\n</head>`);
        }
        return { contents: [{ uri, mimeType: 'text/html', text: htmlContent }] };
      } catch { continue; }
    }
    throw new Error('order-detail.html not found. Ensure src/ui/order-detail.html exists.');
  }

  if (uri.startsWith('ui://cj-mcp/order-list')) {
    logger.debug(`[RESOURCE] order-list requested, cache=${cachedOrderListData != null ? 'HIT' : 'MISS'}`);
    const possiblePaths = [
      join(process.cwd(), 'src', 'ui', 'order-list.html'),
      join(__dirname, '..', '..', 'ui', 'order-list.html'),
    ];
    for (const htmlPath of possiblePaths) {
      try {
        let htmlContent = readFileSync(htmlPath, 'utf-8');
        if (cachedOrderListData) {
          const initScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(cachedOrderListData)};</script>`;
          htmlContent = htmlContent.replace('</head>', `${initScript}\n</head>`);
        }
        return { contents: [{ uri, mimeType: 'text/html', text: htmlContent }] };
      } catch { continue; }
    }
    throw new Error('order-list.html not found. Ensure src/ui/order-list.html exists.');
  }

  throw new Error(`Unknown resource: ${uri}`);
}

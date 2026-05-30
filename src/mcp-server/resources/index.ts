/**
 * @fileoverview Resources 注册中心
 * 管理 MCP UI Resources (如登录页面)
 */
import { readUiHtmlFile } from '../../utils/module-path.js';
import { logger } from '../../utils/logger.js';
import { httpClient, isApiSuccess } from '../../api-client/http-client.js';
import { ENDPOINTS, API_VERSION_PREFIX } from '../../api-client/endpoints.js';
import { getAccessToken } from '../../auth/session.js';
import { getEnvConfig } from '../../config/env.js';
import { getProductUrl } from '../../utils/product-href.js';

/** Cursor / MCP Apps 规范要求的 HTML UI 资源 MIME 类型（纯 text/html 会报 Unsupported UI resource type） */
export const MCP_APP_HTML_MIME = 'text/html;profile=mcp-app';

/**
 * MCP Apps 沙箱 CSP：未声明时 Host 默认 img-src 仅 'self' data:，远程 CDN 图片会被拦截。
 * ChatGPT 可能合并额外白名单；Cursor / Codex 严格按 _meta.ui.csp 执行。
 * @see https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/draft/apps.mdx
 */
export const CJ_MCP_UI_CSP = {
  resourceDomains: [
    'https://cf.cjdropshipping.com',
    'https://frontend.cjdropshipping.com',
    'https://www.cjdropshipping.com',
    'https://cjdropshipping.com',
    'https://*.cjdropshipping.com',
    // 测试环境静态资源 / login API
    'http://www.cjdropshipping.offline.pre.com',
    'http://*.cjdropshipping.offline.pre.com',
  ],
  connectDomains: [
    'https://www.cjdropshipping.com',
    'https://developers.cjdropshipping.com',
    'https://*.cjdropshipping.com',
    'http://www.cjdropshipping.offline.pre.com',
    'http://developers.cjdropshipping.offline.pre.com',
    'http://*.cjdropshipping.offline.pre.com',
  ],
} as const;

const CJ_MCP_UI_META = { ui: { csp: CJ_MCP_UI_CSP } } as const;

interface Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  _meta?: typeof CJ_MCP_UI_META;
}

interface McpAppResourceContent {
  uri: string;
  mimeType: string;
  text: string;
  _meta: typeof CJ_MCP_UI_META;
}

interface ResourceContent {
  contents: McpAppResourceContent[];
}

/** 构造带 CSP 声明的 MCP App HTML 资源内容 */
function buildMcpAppHtmlContent(uri: string, htmlContent: string): McpAppResourceContent {
  return {
    uri,
    mimeType: MCP_APP_HTML_MIME,
    text: htmlContent,
    _meta: CJ_MCP_UI_META,
  };
}

/** 模块级缓存：存储最近一次 search_products / get_product_detail 的数据，用于注入 UI 初始数据 */
let cachedProductListData: unknown = null;
let cachedProductDetailData: unknown = null;
let cachedOrderListData: unknown = null;
let cachedOrderDetailData: unknown = null;

export function setProductListCache(data: unknown): void {
  cachedProductListData = data;
}

/**
 * @note 新增(第4次提交): 供 show_product_list 工具读取当前缓存数据，
 * 注入到 structuredContent，通过 MCP Apps ui/notifications/tool-result 协议
 * 把最新商品数据推送到 iframe，解决 ChatGPT 缓存 HTML 后数据不更新的问题。
 */
export function getProductListCache(): unknown {
  return cachedProductListData;
}

export function setProductDetailCache(data: unknown): void {
  cachedProductDetailData = data;
}

/**
 * @note 新增(第5次提交): 供 show_product_detail 读取当前缓存数据，
 * 注入到 structuredContent，通过 MCP Apps ui/notifications/tool-result 协议
 * 把最新商品详情数据推送到 iframe，解决 ChatGPT 缓存 HTML 后数据不更新的问题。
 */
export function getProductDetailCache(): unknown {
  return cachedProductDetailData;
}

export function hasProductDetailCache(): boolean {
  return cachedProductDetailData != null;
}

export function setOrderListCache(data: unknown): void {
  cachedOrderListData = data;
}

/**
 * @note 新增(第5次提交): 供 show_order_list 读取当前缓存数据，
 * 注入到 structuredContent，通过 MCP Apps ui/notifications/tool-result 协议
 * 把最新订单列表数据推送到 iframe，解决 ChatGPT 缓存 HTML 后数据不更新的问题。
 */
export function getOrderListCache(): unknown {
  return cachedOrderListData;
}

export function setOrderDetailCache(data: unknown): void {
  cachedOrderDetailData = data;
}

/**
 * @note 新增(第5次提交): 供 show_order_detail 读取当前缓存数据，
 * 注入到 structuredContent，通过 MCP Apps ui/notifications/tool-result 协议
 * 把最新订单详情数据推送到 iframe，解决 ChatGPT 缓存 HTML 后数据不更新的问题。
 */
export function getOrderDetailCache(): unknown {
  return cachedOrderDetailData;
}

const resources: Resource[] = [
  {
    uri: 'ui://cj-mcp/login',
    name: 'CJ Login Form',
    description: 'Interactive login form for CJ Dropshipping / CJ登录页面',
    mimeType: MCP_APP_HTML_MIME,
    _meta: CJ_MCP_UI_META,
  },
  {
    uri: 'ui://cj-mcp/product-list',
    name: 'CJ Product List',
    description: 'Interactive product list viewer. Use this to display search_products results in a visual card layout. / 商品列表展示页面，用于以卡片方式可视化展示商品搜索结果。',
    mimeType: MCP_APP_HTML_MIME,
    _meta: CJ_MCP_UI_META,
  },
  {
    uri: 'ui://cj-mcp/product-detail',
    name: 'CJ Product Detail',
    description: 'Interactive product detail viewer. Use this to display get_product_detail results with images, variants, and pricing. / 商品详情展示页面，用于展示商品图片、规格和价格信息。',
    mimeType: MCP_APP_HTML_MIME,
    _meta: CJ_MCP_UI_META,
  },
  {
    uri: 'ui://cj-mcp/order-list',
    name: 'CJ Order List',
    description: 'Visual order list viewer. Displays order status, amounts, logistics and shipping info. / 订单列表展示页面，以卡片方式展示订单状态、金额、物流等信息。',
    mimeType: MCP_APP_HTML_MIME,
    _meta: CJ_MCP_UI_META,
  },
  {
    uri: 'ui://cj-mcp/order-detail',
    name: 'CJ Order Detail',
    description: 'Visual order detail viewer. Displays full order info: status, address, product list, logistics, amounts. / 订单详情展示页面，展示订单状态、收货地址、商品清单、物流信息等完整详情。',
    mimeType: MCP_APP_HTML_MIME,
    _meta: CJ_MCP_UI_META,
  },
];

export function registerResources(): void {
  // Resources are statically defined
}

export function getResourcesList(): Resource[] {
  return resources;
}

export async function handleResourceRead(uri: string): Promise<ResourceContent> {
  /**
   * @note 纠正(72次): 改用前缀匹配替代精确匹配。
   * 原因：getAuthTools() 现在为 wait_for_login 注入唯一时间戳 URI（如 ui://cj-mcp/login?t=1716123456789），
   * 确保 VS Code Copilot 每次在当前对话位置创建新登录 UI，而不是复用旧的 UI 元素。
   * 服务端读取时，只需识别基础路径 'ui://cj-mcp/login' 前缀即可，查询参数仅用于客户端唯一性标识。
   */
  if (uri.startsWith('ui://cj-mcp/login')) {
    const htmlContent = readUiHtmlFile('login.html');
    return { contents: [buildMcpAppHtmlContent(uri, htmlContent)] };
  }

  if (uri.startsWith('ui://cj-mcp/product-list')) {
    // 如果缓存为空且有认证上下文，自动调用 API 获取数据
    if (!cachedProductListData) {
      await fetchProductListFallback();
    }
    logger.debug(`[RESOURCE] product-list requested, cache=${cachedProductListData != null ? 'HIT' : 'MISS'}`);
    let htmlContent = readUiHtmlFile('product-list.html');
    if (cachedProductListData) {
      const initScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(cachedProductListData)};</script>`;
      htmlContent = htmlContent.replace('</head>', `${initScript}\n</head>`);
    }
    return { contents: [buildMcpAppHtmlContent(uri, htmlContent)] };
  }

  if (uri.startsWith('ui://cj-mcp/product-detail')) {
    logger.debug(`[RESOURCE] product-detail requested, cache=${cachedProductDetailData != null ? 'HIT' : 'MISS'}`);
    let htmlContent = readUiHtmlFile('product-detail.html');
    if (cachedProductDetailData) {
      const initScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(cachedProductDetailData)};</script>`;
      htmlContent = htmlContent.replace('</head>', `${initScript}\n</head>`);
    }
    return { contents: [buildMcpAppHtmlContent(uri, htmlContent)] };
  }

  if (uri.startsWith('ui://cj-mcp/order-detail')) {
    logger.debug(`[RESOURCE] order-detail requested, cache=${cachedOrderDetailData != null ? 'HIT' : 'MISS'}`);
    let htmlContent = readUiHtmlFile('order-detail.html');
    if (cachedOrderDetailData) {
      const initScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(cachedOrderDetailData)};</script>`;
      htmlContent = htmlContent.replace('</head>', `${initScript}\n</head>`);
    }
    return { contents: [buildMcpAppHtmlContent(uri, htmlContent)] };
  }

  if (uri.startsWith('ui://cj-mcp/order-list')) {
    // 如果缓存为空且有认证上下文，自动调用 API 获取数据
    if (!cachedOrderListData) {
      await fetchOrderListFallback();
    }
    logger.debug(`[RESOURCE] order-list requested, cache=${cachedOrderListData != null ? 'HIT' : 'MISS'}`);
    let htmlContent = readUiHtmlFile('order-list.html');
    if (cachedOrderListData) {
      const initScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(cachedOrderListData)};</script>`;
      htmlContent = htmlContent.replace('</head>', `${initScript}\n</head>`);
    }
    return { contents: [buildMcpAppHtmlContent(uri, htmlContent)] };
  }

  throw new Error(`Unknown resource: ${uri}`);
}

/**
 * 当 product-list 缓存为空时，尝试自动调用 API 获取默认商品列表数据。
 * 需要在 directTokenStorage / apiKeyStorage 上下文中执行才能成功。
 */
async function fetchProductListFallback(): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    logger.debug('[RESOURCE] product-list fallback: no auth token, skip auto-fetch');
    return;
  }
  try {
    logger.debug('[RESOURCE] product-list fallback: fetching from API...');
    const response = await httpClient.request(ENDPOINTS.product.listV2, {
      method: 'GET',
      params: { page: '1', size: '20', isWarehouse: 'true', startWarehouseInventory: '1' },
      tier: 'read',
    });
    if (isApiSuccess(response) && response.data) {
      // 注入 productUrl
      const config = getEnvConfig();
      type ProductItem = Record<string, unknown>;
      type ContentItem = { productList?: ProductItem[]; [key: string]: unknown };
      const data = response.data as { content?: ContentItem[]; [key: string]: unknown } | null;
      if (data && Array.isArray(data.content)) {
        data.content = data.content.map((contentItem: ContentItem) => {
          if (!Array.isArray(contentItem.productList)) return contentItem;
          return {
            ...contentItem,
            productList: contentItem.productList.map((item: ProductItem) => ({
              ...item,
              productUrl: getProductUrl(config.webBase, String(item.id || ''), String(item.nameEn || '')),
            })),
          };
        });
      }
      cachedProductListData = response.data;
      logger.debug('[RESOURCE] product-list fallback: cache populated');
    }
  } catch (err) {
    logger.debug(`[RESOURCE] product-list fallback failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * 当 order-list 缓存为空时，尝试自动调用 API 获取默认订单列表数据。
 */
async function fetchOrderListFallback(): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    logger.debug('[RESOURCE] order-list fallback: no auth token, skip auto-fetch');
    return;
  }
  try {
    logger.debug('[RESOURCE] order-list fallback: fetching from API...');
    const env = getEnvConfig();
    const urlParams = new URLSearchParams({ pageNum: '1', pageSize: '10' });
    const listUrl = `${env.openApiBase}${API_VERSION_PREFIX}${ENDPOINTS.shopping.listOrder}?${urlParams.toString()}`;
    const listResponse = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'CJ-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });
    const listData = await listResponse.json() as { code?: number; data?: unknown; message?: string };
    if (listData.code === 200 && listData.data) {
      cachedOrderListData = listData.data;
      logger.debug('[RESOURCE] order-list fallback: cache populated');
    }
  } catch (err) {
    logger.debug(`[RESOURCE] order-list fallback failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * @fileoverview 库存管理 MCP Tools
 * 对应 OpenAPI Stock/Warehouse 域端点
 * 描述参考 mycj-react 中私有库存查询、仓库管理的业务场景
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient, AuthExpiredError, isApiSuccess } from '../../api-client/http-client.js';
import { ENDPOINTS } from '../../api-client/endpoints.js';
import { ensureAccessToken } from '../../auth/session.js';
import { getProductUrl } from '../../utils/product-href.js';
import { getEnvConfig } from '../../config/env.js';

export const stockTools: Tool[] = [
  {
    name: 'query_private_inventory',
    description:
      '查询您自己采购并存放在CJ仓库中的私有备货商品（SPU列表）。仅返回您账户下的私有库存，不是CJ平台公开商品。\n' +
      '⚠️【重要区分】\n' +
      '  - "全球仓商品"/"美国仓商品"（CJ平台全球仓可购商品）→ 使用 search_products（isWarehouse=true + countryCode=US）\n' +
      '  - "我自己的备货"/"我购入的商品"/"私有库存"/"我自己入库的" → 使用此工具\n' +
      '【意图映射】\n' +
      '- 用户说「我的备货」「私有库存」「我自己购入的商品」「查我的库存」→ 使用此工具\n' +
      '- 用户说「哪个仓库」→ 先调用 get_warehouses 获取仓库列表，再传 warehouseId 筛选\n' +
      'Query YOUR OWN stocked products (private inventory) you purchased and stored in CJ warehouses.\n' +
      '[IMPORTANT] "global warehouse products" / "US warehouse products from CJ catalog" → use search_products(isWarehouse=true, countryCode=US)\n' +
      '"My own inventory / My stocked products / Private inventory" → use this tool.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pageNum: { type: 'number', description: '页码，默认1 / Page number, default 1' },
        pageSize: { type: 'number', description: '每页数量，默认20，最大200 / Page size, default 20, max 200' },
        keyword: { type: 'string', description: '搜索关键词（商品名/SKU）/ Search keyword (product name/SKU)' },
        warehouseId: {
          type: 'string',
          description:
            '仓库ID，从 get_warehouses 返回结果中获取，用于过滤特定仓库的商品。\n' +
            '例：用户说「美国仓」→ 先 get_warehouses 找 country=US 的仓库，取 warehouseId / ' +
            'Warehouse ID from get_warehouses. Use to filter by specific warehouse (e.g. US warehouse → country=US).',
        },
      },
      required: [],
    },
  },
  {
    name: 'query_sku_details',
    description:
      '查询私有库存SKU明细，查看某个商品的各变体库存数量和仓库分布 / ' +
      'Query private inventory SKU details. View variant stock quantities and warehouse distribution for a product.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        productId: { type: 'string', description: '商品ID / Product ID' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'query_sku_detail_page',
    description:
      '分页查询SKU明细列表，适用于大量SKU的商品 / ' +
      'Paginated SKU detail list query. Suitable for products with many SKUs.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pageNum: { type: 'number', description: '页码 / Page number' },
        pageSize: { type: 'number', description: '每页数量 / Page size' },
        keyword: { type: 'string', description: '搜索关键词 / Search keyword' },
      },
      required: [],
    },
  },
  {
    name: 'query_sku_detail_by_sku',
    description:
      '通过变体SKU精确查询私有库存的SKU明细信息（入库批次、备注等）。' +
      '触发场景：「查一下 SKU CJXXX-Black 的私有库存明细」「这个变体我备了多少货」。' +
      '⚠️ 查询 CJ 公开库存请使用 query_cj_inventory。',
    inputSchema: {
      type: 'object' as const,
      properties: {
        variantSku: { type: 'string', description: '变体SKU编码（必填）/ Variant SKU code (required)' },
      },
      required: ['variantSku'],
    },
  },
  {
    name: 'get_product_inventory',
    description:
      '查询某个商品在各国/各子仓的库存分布，返回各变体在不同仓库的库存数量和子仓ID（stockId）。\n' +
      '【意图映射】\n' +
      '- 用户说「这个商品在美国仓有多少库存」「查商品 XXX 的库存」「这个商品在哪些仓库有货」→ 使用此工具\n' +
      '- 返回数据中 inventories[].stock[].stockId 是子仓UUID，可传给 get_storage_info 查询仓库详情\n' +
      'Query inventory of a product across countries and sub-warehouses.\n' +
      '[Intent mapping] "how much stock does product XXX have" / "which warehouses stock this product" → use this tool.\n' +
      '[Key field] inventories[].stock[].stockId = sub-warehouse UUID → pass to get_storage_info for warehouse details.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pid: {
          type: 'string',
          description: '商品ID（必填），来自 search_products 或 get_product_detail 返回的 pid / Product ID (required), from search_products or get_product_detail response field "pid"',
        },
      },
      required: ['pid'],
    },
  },
  {
    name: 'get_storage_info',
    description:
      '查询某个具体CJ仓库的详细信息（地址、联系方式、支持的物流品牌、是否支持自提等）。\n' +
      '⚠️【重要】需要提供 storageId（UUID格式，如 "2991a224-737b-42a3-a1d9-8ccd2936b341"），不是国家代码！\n' +
      '【如何获取 storageId】（两个来源）：\n' +
      '  1. 订单维度：从 get_order_detail 返回的 storageId 字段获取（发货仓库ID）\n' +
      '     → 用户说「这个订单从哪个仓库发的」→ 先调 get_order_detail，取 storageId，再调本工具\n' +
      '  2. 商品维度：从 get_product_inventory(pid) 返回的 inventories[].stock[].stockId 字段获取（子仓ID）\n' +
      '     → 用户说「这个商品在哪个仓库」「查商品 XXX 对应的仓库信息」→ 先调 get_product_inventory，取 stockId，再调本工具\n' +
      '【意图映射】\n' +
      '  - 「仓库地址是什么」「仓库支持哪些物流」「这个仓库详情」+ 有 storageId/stockId → 使用此工具\n' +
      '  - 「CJ有哪些仓库」「所有仓库列表」→ 使用 get_warehouses（不是此工具）\n\n' +
      'Get DETAILED info of a SPECIFIC CJ warehouse (address, logistics brands, self-pickup, etc.).\n' +
      '[storageId sources]\n' +
      '  1. Order: from get_order_detail response field "storageId" (UUID format)\n' +
      '  2. Product: from get_product_inventory response inventories[].stock[].stockId (sub-warehouse UUID)\n' +
      '[NOT for] listing all CJ warehouses — use get_warehouses for that.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        storageId: {
          type: 'string',
          description:
            '仓库UUID（必填）。来源：\n' +
            '  1. 来自 get_order_detail 响应的 storageId 字段（发货仓库）\n' +
            '  2. 来自 get_product_inventory 响应的 inventories[].stock[].stockId 字段（子仓）\n' +
            '  ⚠️ stockId 和 storageId 是同一种 UUID，直接将 stockId 的值传给本参数即可！\n' +
            'Warehouse UUID (required).\n' +
            '  Source 1: get_order_detail response field "storageId"\n' +
            '  Source 2: get_product_inventory response field "inventories[].stock[].stockId"\n' +
            '  ⚠️ stockId IS the same UUID — pass it directly to this storageId parameter.',
        },
      },
      required: ['storageId'],
    },
  },
  {
    name: 'query_warehouse_order_pictures',
    description:
      '查询仓库处理订单时拍摄的实操照片（打包图、入库图等）。\n' +
      '【意图映射】\n' +
      '- 用户说「查一下这个订单的仓库图片」「查看订单的打包照片」「仓库有没有给我拍照」→ 使用此工具\n' +
      '- 可同时查询多个订单的图片\n' +
      'Query warehouse processing photos (packing photos, inbound photos, etc.) for orders.\n' +
      '[Intent mapping] "warehouse order photos" / "packing photos for my order" / "show order pictures from warehouse" → use this tool.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        orderIds: {
          type: 'array',
          items: { type: 'string' },
          description: '订单ID列表（必填），最多支持同时查询多个订单 / List of order IDs (required), supports batch query',
        },
      },
      required: ['orderIds'],
    },
  },
];

export async function handleStockTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const token = await ensureAccessToken();
  if (!token) {
    return {
      content: [{
        type: 'text',
        text: '❌ 未登录或登录已过期，请先调用 show_login_form 登录 / Not logged in or session expired. Please call show_login_form first.',
      }],
      isError: true,
    };
  }

  try {
    switch (name) {
      case 'query_private_inventory': {
        /**
         * @note 纠正(9次): 新增 warehouseId 参数支持仓库过滤，提升页面大小上限至200，并注入 productUrl
         */
        const requestBody: Record<string, unknown> = {
          pageNum: (args.pageNum as number) || 1,
          pageSize: Math.min((args.pageSize as number) || 20, 200),
          keyword: args.keyword,
        };
        if (args.warehouseId) requestBody.warehouseId = String(args.warehouseId);

        const response = await httpClient.request(ENDPOINTS.stock.querySpuPage, {
          body: requestBody,
          tier: 'read',
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: 'text', text: `查询库存失败 / Query inventory failed: ${response.message}` }], isError: true };
        }

        // 注入 productUrl 字段，方便 AI 直接给用户返回可点击链接
        const config = getEnvConfig();
        type SpuItem = Record<string, unknown>;
        const data = response.data as { list?: SpuItem[]; records?: SpuItem[]; [key: string]: unknown } | null;
        if (data) {
          const list = Array.isArray(data.list) ? data.list : Array.isArray(data.records) ? data.records : null;
          if (list) {
            const listKey = Array.isArray(data.list) ? 'list' : 'records';
            (data as Record<string, unknown>)[listKey] = list.map((item: SpuItem) => {
              const pid = String(item.pid || item.productId || '');
              const name = String(item.productNameEn || item.productName || '');
              return pid ? { ...item, productUrl: getProductUrl(config.webBase, pid, name) } : item;
            });
          }
        }

        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'query_sku_details': {
        const response = await httpClient.request(ENDPOINTS.stock.querySkuListByProductId, {
          body: { productId: args.productId },
          tier: 'read',
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: 'text', text: `查询SKU失败 / Query SKU failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'query_sku_detail_page': {
        const response = await httpClient.request(ENDPOINTS.stock.querySkuDetailPage, {
          body: {
            pageNum: (args.pageNum as number) || 1,
            pageSize: Math.min((args.pageSize as number) || 20, 50),
            keyword: args.keyword,
          },
          tier: 'read',
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: 'text', text: `查询SKU明细失败 / Query SKU details failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'query_sku_detail_by_sku': {
        /**
         * @note 纠正(13次): 新增 query_sku_detail_by_sku，按变体SKU精确查询私有库存明细。
         * 对应已注册端点 ENDPOINTS.stock.querySkuDetailListBySku。
         */
        if (!args.variantSku) {
          return { content: [{ type: 'text', text: '❌ 请提供 variantSku 参数 / Please provide variantSku.' }], isError: true };
        }
        const response = await httpClient.request(ENDPOINTS.stock.querySkuDetailListBySku, {
          body: { sku: String(args.variantSku) },
          tier: 'read',
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: 'text', text: `按SKU查询明细失败 / Query SKU detail by sku failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'get_product_inventory': {
        /**
         * @note 第25次提交: 新增 get_product_inventory，查询商品在各国/各子仓的库存分布。
         * 对应 GET /product/stock/getInventoryByPid?pid=xxx。
         * 返回的 inventories[].stock[].stockId 是子仓UUID，可传给 get_storage_info。
         * @note 第26次提交: stockId 可能带花括号（如 {6709CCD7-...}），自动去除花括号并选择正确仓库。
         */
        if (!args.pid) {
          return {
            content: [{ type: 'text', text: '❌ 请提供 pid（商品ID）/ Please provide pid (Product ID).' }],
            isError: true,
          };
        }
        const invResponse = await httpClient.request(ENDPOINTS.product.stockGetInventoryByPid, {
          method: 'GET',
          params: { pid: String(args.pid) },
          tier: 'read',
        });
        if (!isApiSuccess(invResponse)) {
          return { content: [{ type: 'text', text: `查询商品库存失败 / Get product inventory failed: ${invResponse.message}` }], isError: true };
        }

        // 自动去除 stockId 中的花括号，例如 {6709CCD7-0DC7-43B1-B310-17AB499E9B0A} → 6709CCD7-0DC7-43B1-B310-17AB499E9B0A
        type StockItem = { stockId?: string; inventory?: number; factoryInventory?: number; [key: string]: unknown };
        type InventoryItem = { stock?: StockItem[] | null; cjInventory?: number; factoryInventory?: number; [key: string]: unknown };
        type VariantInventory = { inventory?: InventoryItem[]; [key: string]: unknown };
        const rawData = invResponse.data as { variantInventories?: VariantInventory[]; inventories?: unknown[]; [key: string]: unknown } | null;
        if (rawData?.variantInventories) {
          rawData.variantInventories.forEach((vi: VariantInventory) => {
            (vi.inventory || []).forEach((inv: InventoryItem) => {
              (inv.stock || []).forEach((s: StockItem) => {
                if (s.stockId) {
                  // 去除花括号: {6709CCD7-...} → 6709CCD7-...
                  s.stockId = s.stockId.replace(/^\{|\}$/g, '');
                }
              });
            });
          });
        }

        return {
          content: [{
            type: 'text',
            text: `✅ 商品库存查询成功。\n` +
              `【如何选择正确的 stockId 传给 get_storage_info】:\n` +
              `  - 优先选 cjInventory > 0 的 stock 条目的 stockId（CJ自有仓）\n` +
              `  - 若只有 factoryInventory > 0 的条目，也可使用其 stockId（工厂仓）\n` +
              `  - stockId 中的花括号已自动去除，可直接传给 get_storage_info 的 storageId 参数\n\n` +
              JSON.stringify(rawData, null, 2),
          }],
        };
      }

      case 'get_storage_info': {
        /**
         * @note 纠正(13次): 新增 get_storage_info，查询指定仓库详情。
         * 对应 GET /warehouse/detail?id=storageId。
         */
        if (!args.storageId) {
          return {
            content: [{
              type: 'text',
              text: '❌ 请提供 storageId（UUID格式，如 "2991a224-737b-42a3-a1d9-8ccd2936b341"）。\n' +
                '💡 获取方式：\n' +
                '  1. 调用 get_order_detail，返回结果包含 storageId 字段（订单发货仓库）\n' +
                '  2. 调用 get_product_inventory(pid)，返回 inventories[].stock[].stockId（商品子仓）\n' +
                '  ⚠️ stockId 就是 storageId，直接传 stockId 的值即可！\n' +
                'Please provide storageId (UUID). From get_order_detail storageId, or get_product_inventory stock[].stockId (same UUID, pass directly).',
            }],
            isError: true,
          };
        }
        const response = await httpClient.request(ENDPOINTS.warehouse.detail, {
          method: 'GET',
          params: { id: String(args.storageId) },
          tier: 'read',
        });
        if (!isApiSuccess(response)) {
          return { content: [{ type: 'text', text: `查询仓库详情失败 / Get storage info failed: ${response.message}` }], isError: true };
        }
        return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
      }

      case 'query_warehouse_order_pictures': {
        /**
         * @note 第22次提交: 新增 query_warehouse_order_pictures，查询仓库处理订单的实操图片。
         * 对应 POST /storehouseCenterWeb/syncStorehouseVideoRequests。
         * 支持批量查询多个订单的仓库图片（打包图、入库图等）。
         */
        if (!args.orderIds || !Array.isArray(args.orderIds) || (args.orderIds as string[]).length === 0) {
          return {
            content: [{
              type: 'text',
              text: '❌ 请提供 orderIds 列表（至少一个订单ID）/ Please provide orderIds array (at least one order ID).',
            }],
            isError: true,
          };
        }
        const orderIdList = (args.orderIds as string[]).map(String);
        const picResp = await httpClient.request(ENDPOINTS.warehouse.orderPictures, {
          body: { orderIdList },
          tier: 'read',
        });
        if (!isApiSuccess(picResp)) {
          return {
            content: [{
              type: 'text',
              text: `查询仓库订单图片失败 / Query warehouse order pictures failed: ${picResp.message}`,
            }],
            isError: true,
          };
        }
        return { content: [{ type: 'text', text: JSON.stringify(picResp.data, null, 2) }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown stock tool: ${name}` }], isError: true };
    }
  } catch (error: unknown) {
    if (error instanceof AuthExpiredError) {
      return { content: [{ type: 'text', text: error.message }], isError: true };
    }
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
  }
}

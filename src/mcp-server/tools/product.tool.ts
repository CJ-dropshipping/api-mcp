/**
 * @fileoverview 商品查询 MCP Tools
 * - search_products: 搜索商品 (对应 /product/listV2 或 /product/query)
 * - get_category_tree: 获取分类树 (对应 /product/getCategory)
 * - get_warehouses: 获取全球仓库列表 (对应 /product/globalWarehouseList)
 *
 * 描述参考 mycj-react 中商品搜索、分类筛选、仓库选择的业务场景
 *
 * @note 纠正(73次): search_products 返回结果中的每个商品项注入 productUrl 字段，
 * 使用 getProductUrl 工具函数生成与前端一致的商品详情页链接格式：
 * /product/${urlQueryFormat(name)}-p-${id}.html
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { httpClient, AuthExpiredError, isApiSuccess } from '../../api-client/http-client.js';
import { ENDPOINTS } from '../../api-client/endpoints.js';
import { ensureAccessToken, getAccessToken } from '../../auth/session.js';
import { setTokenGetter } from '../../api-client/http-client.js';
import { getEnvConfig } from '../../config/env.js';
import { getProductUrl } from '../../utils/product-href.js';
import { setProductListCache, getProductListCache, setProductDetailCache, getProductDetailCache, hasProductDetailCache } from '../resources/index.js';

// 注入 token getter (同步获取缓存的 token)
setTokenGetter(() => getAccessToken());

export const productTools: Tool[] = [
  {
    name: 'search_products',
    description:
      '搜索CJ平台上已有的商品目录，支持关键词、分类、价格、国家、仓库类型等多维度筛选。\n' +
      '【两步展示流程 - 必须按顺序执行】\n' +
      '  第1步：先调用本工具 search_products 获取最新数据\n' +
      '  第2步：再调用 show_product_list 打开可视化卡片界面（数据已缓存）\n' +
      '⚠️ 本工具仅获取数据，不渲染 UI；UI 渲染由 show_product_list 独立完成。\n' +
      '⚠️ 不要尝试在本工具的返回结果中注入 _meta.ui，那样会导致 UI 在数据到达前就渲染（旧数据）。\n' +
      '【意图映射规则】\n' +
      '- 用户说「全球仓商品」「美国仓商品」「美国仓」「US仓」→ isWarehouse=true, countryCode=US\n' +
      '- 用户说「中国仓商品」「CN仓商品」→ isWarehouse=true, countryCode=CN\n' +
      '- 用户说「全球仓」不指定国家 → isWarehouse=true\n' +
      '- 用户说「找手机壳」「搜一下鼠标」→ keyword=对应关键词（支持中英文）\n' +
      '- 用户说「50美元以内的XX」→ keyword=XX, maxPrice=50\n' +
      '- 用户说「免费配送」「包邮」→ addMarkStatus=1\n' +
      '- 用户说「按价格从低到高」→ orderBy=2, sort=asc\n' +
      '- 用户说「给我看更多」「下一页」→ pageNum 递增\n' +
      '- 用户说「前N条」「N条数据」「N个商品」→ pageSize=N（未指定时默认 pageSize=20）\n' +
      '- 用户说「我自己的备货」「我的私有库存」「我入库的商品」→ 使用 query_private_inventory\n' +
      '⚠️【搜品 vs 搜索商品 区分】\n' +
      '- 此工具仅搜索 CJ 平台**现有商品目录**中的商品\n' +
      '- 若用户说「帮我搜品」「我想让CJ帮我找货源」「提交搜品需求」「这个商品CJ有没有代发」「我在1688/速卖通/阿里看到一个商品，帮我找」→ 使用 create_sourcing（不是此工具）\n' +
      '【Two-step display - MUST call in order】\n' +
      '  Step1: Call this tool (search_products) to fetch data\n' +
      '  Step2: Call show_product_list to render the visual card UI (data already cached)\n' +
      '⚠️ This tool fetches data ONLY; UI rendering is done by show_product_list separately.\n' +
      'Search EXISTING products in CJ catalog.\n' +
      '[Intent mapping] "US warehouse" → isWarehouse=true, countryCode=US;\n' +
      '"my own stock/private inventory" → use query_private_inventory instead.\n' +
      '[NOT for] "sourcing request" / "find product not on CJ" / "I found this on 1688, can CJ source it?" → use create_sourcing.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        keyword: {
          type: 'string',
          description: '搜索关键词（商品名/SKU/描述）/ Search keyword (product name/SKU/description)',
        },
        categoryId: {
          type: 'string',
          description: '分类ID，可通过 get_category_tree 获取 / Category ID from get_category_tree',
        },
        countryCode: {
          type: 'string',
          description:
            '国家代码，用于过滤指定国家有库存的商品，如 US/CN/GB/DE/FR 等。\n' +
            '例：美国仓 → countryCode=US；中国仓 → countryCode=CN / ' +
            'Country code to filter products with inventory in that country. e.g. US, CN, GB. US warehouse → US.',
        },
        isWarehouse: {
          type: 'boolean',
          description:
            '是否查询全球仓商品。true=只查全球仓商品，false/不传=全部商品 / ' +
            'Filter global warehouse products. true=global warehouse only. Use with countryCode for specific country.',
        },
        minPrice: {
          type: 'number',
          description: '最低价格(USD) / Minimum price in USD',
        },
        maxPrice: {
          type: 'number',
          description: '最高价格(USD) / Maximum price in USD',
        },
        addMarkStatus: {
          type: 'number',
          description: '包邮筛选：0-不包邮，1-包邮 / Free shipping filter: 0-not free, 1-free shipping',
        },
        productType: {
          type: 'string',
          description:
            '商品类型（listV2 API 使用字符串格式）：ORDINARY_PRODUCT-普通商品，SUPPLIER_PRODUCT-供应商商品 / ' +
            'Product type: ORDINARY_PRODUCT (regular), SUPPLIER_PRODUCT (supplier)',
        },
        productFlag: {
          type: 'number',
          description: '商品标签：0-热卖，1-新品，2-视频，3-滞销 / Product flag: 0-Trending, 1-New, 2-Video, 3-Slow-moving',
        },
        sort: {
          type: 'string',
          description: '排序方向：desc-降序（默认），asc-升序 / Sort direction: desc(default), asc',
        },
        orderBy: {
          type: 'number',
          description: '排序字段：0-最佳匹配（默认），1-刊登数，2-价格，3-创建时间，4-库存 / Sort field: 0-Best match, 1-Listed count, 2-Price, 3-Create time, 4-Inventory',
        },
        pageNum: {
          type: 'number',
          description: '页码，默认1 / Page number, default 1',
        },
        pageSize: {
          type: 'number',
          description: '每页数量，默认20，最大100 / Page size, default 20, max 100',
        },
        startWarehouseInventory: {
          type: 'number',
          description:
            '起始库存下限（≥1），默认为1，只搜索有库存的商品。\n' +
            '用户说「库存大于N」「库存至少N件」「库存不低于N」→ 传入对应数值（最小为1）。\n' +
            'Minimum warehouse inventory (≥1), default 1. Only returns products with stock. ' +
            'User: "stock > N" / "at least N in stock" → pass N (min 1).',
        },
        lv2categoryList: {
          type: 'array',
          items: { type: 'string' },
          description: '二级类目ID列表，用于精确筛选 / List of second-level category IDs for precise filtering',
        },
        lv3categoryList: {
          type: 'array',
          items: { type: 'string' },
          description: '三级类目ID列表 / List of third-level category IDs',
        },
        features: {
          type: 'array',
          items: { type: 'string' },
          description:
            '附加特性，用于控制返回数据范围。可选值：\n' +
            '  enable_description — 返回商品详情\n' +
            '  enable_category — 返回商品类目信息\n' +
            '  enable_combine — 返回组合商品信息\n' +
            '  enable_video — 返回视频ID\n' +
            'Extra features: enable_description, enable_category, enable_combine, enable_video',
        },
        zonePlatform: {
          type: 'string',
          description:
            '专区平台，用于筛选适合特定电商平台的商品。可选值：\n' +
            '  shopify / ebay / amazon / tiktok / etsy / walmart 等\n' +
            'Platform filter: shopify, ebay, amazon, tiktok, etsy, walmart, etc.',
        },
        supplierId: {
          type: 'string',
          description: '供应商ID，筛选指定供应商的商品 / Supplier ID to filter products by supplier',
        },
        isSelfPickup: {
          type: 'number',
          description: '是否支持自提：0-不支持，1-支持 / Self pickup: 0-no, 1-yes',
        },
        hasCertification: {
          type: 'number',
          description: '是否资质认证：0-无，1-有 / Certification: 0-no, 1-yes',
        },
        timeStart: {
          type: 'string',
          description:
            '上架时间起始（时间戳毫秒），筛选在此之后上架的商品 / Start time for listing date (ms timestamp)',
        },
        timeEnd: {
          type: 'string',
          description:
            '上架时间截止（时间戳毫秒），筛选在此之前上架的商品 / End time for listing date (ms timestamp)',
        },
        endWarehouseInventory: {
          type: 'number',
          description:
            '结束库存上限，筛选库存数量小于等于该值的商品。\n' +
            '用户说「库存不超过N」「最多N件」→ 配合 startWarehouseInventory 一起使用。\n' +
            'End warehouse inventory (≤N). Use with startWarehouseInventory for range.',
        },
        verifiedWarehouse: {
          type: 'number',
          description:
            '验证库存类型筛选：0/不传=全部，1=已验证库存，2=待验证库存 / ' +
            'Verified warehouse filter: 0/all(default), 1=verified, 2=pending verification',
        },
        customization: {
          type: 'number',
          description: '是否定制商品：0-否，1-是 / Customization: 0-no, 1-yes',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_category_tree',
    description:
      '获取CJ商品分类树，用于筛选搜索范围。一级分类如服装、电子、家居等 / ' +
      'Get CJ product category tree for filtering. Top categories: Clothing, Electronics, Home, etc.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        parentId: {
          type: 'string',
          description: '父分类ID，不传返回顶级分类 / Parent category ID, omit for top-level categories',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_warehouses',
    description:
      '【仅用于】获取CJ全球仓库区域列表（国家维度：US/CN/DE/GB/PL等），含各区域 warehouseId，主要用于过滤 query_private_inventory 的仓库维度。\n' +
      '⚠️【严格意图区分】\n' +
      '  - 用户说「CJ有哪些仓库」「全球仓有哪些」「美国/中国/德国仓的ID是多少」→ 使用此工具\n' +
      '  - 用户说「查看某个仓库的详情/地址/支持物流」→ 使用 get_storage_info（需要 storageId UUID）\n' +
      '  - 用户说「某个订单在哪个仓库」「这个订单的仓库信息」→ 先调用 get_order_detail 获取 storageId，再调 get_storage_info\n' +
      '⚠️ 此工具返回的 id 字段是区域标识，不是仓库UUID，不可直接用于 get_storage_info。\n\n' +
      'Get CJ global warehouse REGION list (country level: US/CN/DE/GB...) with warehouseId for inventory filtering.\n' +
      '[NOT for] getting warehouse address/details — use get_storage_info with a UUID storageId for that.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_product_detail',
    description:
      '查询CJ单个商品的完整详情，包括商品名称、图片、价格、变体(颜色/尺码)、库存、描述、物流属性等。\n' +
      '【两步展示流程 - 必须按顺序执行】\n' +
      '  第1步：先调用本工具 get_product_detail 获取最新数据\n' +
      '  第2步：再调用 show_product_detail(pid) 打开可视化详情界面（数据已缓存）\n' +
      '⚠️ 本工具仅获取数据，不渲染 UI；UI 渲染由 show_product_detail(pid) 独立完成。\n' +
      '⚠️ 不要尝试在本工具的返回结果中注入 _meta.ui，那样会导致 UI 在数据到达前就渲染（旧数据）。\n' +
      '【意图映射】\n' +
      '- 用户说「这个商品的详情」「商品详细信息」「查一下这个商品」→ 使用此工具\n' +
      '- 用户说「这个 pid/SKU 的商品」→ 传入 pid 或 productSku\n' +
      '- 用户说「美国仓有多少库存」→ countryCode=US\n' +
      '- pid/productSku/variantSku 三选一必传 / One of pid/productSku/variantSku is required.\n' +
      '【Two-step display - MUST call in order】\n' +
      '  Step1: Call this tool (get_product_detail) to fetch data\n' +
      '  Step2: Call show_product_detail(pid) to render the visual detail UI (data already cached)\n' +
      '⚠️ This tool fetches data ONLY; UI rendering is done by show_product_detail(pid) separately.\n' +
      'Get full product details: name, images, price, variants(color/size), inventory, description, logistics.\n' +
      '[Intent mapping] "product detail" / "查这个商品" / "show product info" → use this tool with pid or productSku.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pid: {
          type: 'string',
          description: '商品ID（从搜索结果中获取）/ Product ID (from search results)',
        },
        productSku: {
          type: 'string',
          description: '商品SPU编码，如 CJJJJTJT05843 / Product SPU code',
        },
        variantSku: {
          type: 'string',
          description: '变体SKU编码，如 CJJJJTJT05843-Black / Variant SKU code',
        },
        countryCode: {
          type: 'string',
          description: '国家代码，只返回该国有库存的变体，如 US/CN/GB / Country code to filter variants with inventory in that country',
        },
        features: {
          type: 'string',
          description:
            '附加功能，多个用逗号分隔：enable_combine（含组合变体），enable_video（含视频）/ ' +
            'Extra features (comma-separated): enable_combine, enable_video',
        },
      },
      required: [],
    },
  },
  {
    name: 'query_cj_inventory',
    description: [
      '查询 CJ 平台公开商品库存（非私有备货库存）。',
      '触发场景：「这个商品CJ有多少库存」「SKU CJXXX 还有多少货」「查一下某个变体的CJ库存」。',
      '⚠️ 如果查询自己备货的私有库存请使用 query_private_inventory。',
      '支持三种查询方式（三选一）：vid（变体ID）/ sku（变体SKU或SPU）/ pid（商品ID）。',
      '返回各仓库的库存数量（totalInventoryNum / cjInventoryNum / factoryInventoryNum）。',
    ].join(' '),
    inputSchema: {
      type: 'object',
      properties: {
        vid: { type: 'string', description: '变体ID（vid），与 sku/pid 三选一 / Variant ID' },
        sku: { type: 'string', description: '变体SKU或SPU编码，与 vid/pid 三选一 / Variant SKU or SPU code' },
        pid: { type: 'string', description: '商品ID（pid），与 vid/sku 三选一 / Product ID' },
      },
      required: [],
    },
  },
  {
    name: 'get_my_products',
    description: [
      '查询我的选品列表（已添加到我的商品的产品），支持关键词搜索和时间筛选。',
      '触发场景：「我保存的商品」「我的选品列表」「查一下我收藏的商品」「isListed=1 已刊登的商品」。',
      '⚠️ 与 search_products 不同：此工具返回用户主动添加过的商品，不是全量搜索。',
    ].join(' '),
    inputSchema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'SKU/SPU/商品名搜索词 / Keyword: SKU, SPU, or product name' },
        categoryId: { type: 'string', description: '品类ID / Category ID' },
        startAt: { type: 'string', description: '添加时间起始（ISO或时间戳）/ Start time for when product was added' },
        endAt: { type: 'string', description: '添加时间截止 / End time' },
        isListed: { type: 'number', description: '是否已刊登 0/1 / Is listed: 0=no, 1=yes' },
        visiable: { type: 'number', description: '是否可见 0/1 / Visibility: 0=no, 1=yes' },
        hasPacked: { type: 'number', description: '是否已包装 0/1 / Packed status: 0=no, 1=yes' },
        hasVirPacked: { type: 'number', description: '是否已虚拟包装 0/1 / Virtual packing status: 0=no, 1=yes' },
        pageNum: { type: 'number', description: '页码，默认 1 / Page number' },
        pageSize: { type: 'number', description: '每页数量，默认 20，最大 200 / Page size, max 200' },
      },
      required: [],
    },
  },
  {
    name: 'get_product_variants',
    description: [
      '查询商品的所有变体列表（颜色/尺码/规格）及其价格、重量、图片等信息。',
      '触发场景：「这个商品有哪些颜色」「获取变体列表」「查一下 pid=XX 的所有 SKU」。',
      '参数 pid/productSku/variantSku 三选一，countryCode 可选用于筛选有库存的变体。',
    ].join(' '),
    inputSchema: {
      type: 'object',
      properties: {
        pid: { type: 'string', description: '商品ID（pid）/ Product ID' },
        productSku: { type: 'string', description: '商品SPU编码 / Product SPU code' },
        variantSku: { type: 'string', description: '变体SKU编码 / Variant SKU code' },
        countryCode: { type: 'string', description: '国家代码，只返回该国有库存的变体，如 US/CN / Country code' },
      },
      required: [],
    },
  },
  {
    name: 'create_sourcing',
    description: [
      '向 CJ 提交搜品/采购需求（Sourcing Request），请求 CJ 帮您寻找或采购特定商品。',
      '【触发场景】：',
      '  - 「帮我搜品」「我要搜品」「提交搜品需求」',
      '  - 「帮我找货源」「CJ能不能代发这个商品」',
      '  - 「我在1688/速卖通/阿里/ebay看到这个商品，帮我找」',
      '  - 「create sourcing request」「post sourcing」',
      '  - 用户提供了商品名称 + 图片URL，要求CJ帮忙采购',
      '⚠️ productName 和 productImage 为必填（商品名称 + 图片URL）。',
      '⚠️【注意区分】: 此工具是创建新搜品工单，不是搜索CJ现有商品（现有商品用 search_products）。',
      '返回 cjSourcingId，可用 query_sourcing 查询处理结果。',
    ].join('\n'),
    inputSchema: {
      type: 'object',
      properties: {
        productName: { type: 'string', description: '商品名称（必填）/ Product name (required)' },
        productImage: { type: 'string', description: '商品图片URL（必填）/ Product image URL (required)' },
        productUrl: { type: 'string', description: '商品原始链接 / Original product URL' },
        remark: { type: 'string', description: '备注说明 / Remark / notes' },
        price: { type: 'string', description: '参考价格（USD）/ Reference price in USD' },
        thirdProductId: { type: 'string', description: '第三方商品ID / Third-party product ID' },
        thirdVariantId: { type: 'string', description: '第三方变体ID / Third-party variant ID' },
        thirdProductSku: { type: 'string', description: '第三方商品SKU / Third-party product SKU' },
      },
      required: ['productName', 'productImage'],
    },
  },
  {
    name: 'query_sourcing',
    description: [
      '查询搜品需求（Sourcing）的处理结果和状态。',
      '触发场景：「我的搜品需求处理了吗」「搜品结果出来了吗」「查询 sourcingId 285 的状态」「query sourcing result」。',
      '参数 sourceIds 为 CJ 分配的搜品ID数组（从 create_sourcing 获取）。',
    ].join(' '),
    inputSchema: {
      type: 'object',
      properties: {
        sourceIds: {
          type: 'array',
          items: { type: 'string' },
          description: '采购需求ID数组 / Array of CJ sourcing IDs',
        },
        sourceStatuses: {
          type: 'array',
          items: { type: 'string' },
          description: '按状态筛选，如 "processing"/"finished"/"cancelled" / Filter by status: processing/finished/cancelled',
        },
        pageNum: { type: 'number', description: '页码，默认 1 / Page number, default 1' },
        pageSize: { type: 'number', description: '每页数量，默认 20 / Page size, default 20' },
      },
      required: [],
    },
  },
  {
    name: 'list_product_connections',
    description: [
      '查询店铺商品连接记录列表（CJ商品与平台商品的对应关系）。',
      '触发场景：「查看我的商品连接」「这个商品连接了哪些店铺」「product connection list」。',
      '可按 shopId/platformProductId/platformVariantId 筛选，支持分页。',
    ].join(' '),
    inputSchema: {
      type: 'object',
      properties: {
        shopId: { type: 'string', description: '店铺ID（可选）/ Shop ID (optional)' },
        platformProductId: { type: 'string', description: '平台商品ID（可选）/ Platform product ID' },
        platformVariantId: { type: 'string', description: '平台变体ID（可选）/ Platform variant ID' },
        page: { type: 'number', description: '页码，默认1 / Page number' },
        pageSize: { type: 'number', description: '每页数量，默认10，最大100 / Page size, max 100' },
      },
      required: [],
    },
  },
  {
    name: 'get_product_reviews',
    description: [
      '查询商品的买家评价（评分、评论内容、图片）。',
      '触发场景：「这个商品的评价怎么样」「查一下 pid=XX 的评价」「product reviews」「customer comments」。',
      '参数 pid 为必填，score 可按评分（1-5）筛选，支持分页。',
    ].join(' '),
    inputSchema: {
      type: 'object',
      properties: {
        pid: { type: 'string', description: '商品ID（必填）/ Product ID (required)' },
        score: { type: 'number', description: '按评分筛选 1-5（可选）/ Filter by score 1-5 (optional)' },
        pageNum: { type: 'number', description: '页码，默认1 / Page number' },
        pageSize: { type: 'number', description: '每页数量，默认20 / Page size, default 20' },
      },
      required: ['pid'],
    },
  },
  {
    name: 'create_product_connection',
    description: [
      '将CJ商品（变体）与平台店铺商品（变体）进行绑定，建立商品连接关系。',
      '⚠️【敏感操作 - 需用户确认】建立连接后，平台店铺产生的订单将自动匹配到对应CJ商品进行履约。',
      '触发场景：「绑定商品」「创建商品连接」「将 CJ 商品连接到 Shopify 商品」「create product connection」。',
      '必填参数：defaultArea（发货区域）、logistics（物流方式名称如 PacketPlus）、cjProductId（CJ商品ID）、platformProductId（平台商品ID）、variantList（变体映射列表）。',
    ].join(' '),
    inputSchema: {
      type: 'object' as const,
      properties: {
        cjProductId: { type: 'string', description: 'CJ商品ID（必填）/ CJ product ID (required)' },
        platformProductId: { type: 'string', description: '平台商品ID（必填）/ Platform product ID (required)' },
        defaultArea: { type: 'number', description: '默认发货区域（必填，如 1）/ Default area (required, e.g. 1)' },
        logistics: { type: 'string', description: '物流方式名称（必填，如 PacketPlus）/ Logistics method name (required)' },
        shopId: { type: 'string', description: '店铺ID（可选，不填则使用账户绑定的默认店铺）/ Shop ID (optional)' },
        sourceCountryCode: { type: 'string', description: '发货国家代码（可选，如 CN）/ Source country code' },
        targetCountryCode: { type: 'string', description: '目的国家代码（可选，如 US）/ Target country code' },
        variantList: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              cjVariantId: { type: 'string', description: 'CJ变体ID / CJ variant ID' },
              platformVariantId: { type: 'string', description: '平台变体ID / Platform variant ID' },
            },
            required: ['cjVariantId', 'platformVariantId'],
          },
          description: '变体映射列表（必填，至少一项）/ Variant mapping list (required, at least one)',
        },
      },
      required: ['cjProductId', 'platformProductId', 'defaultArea', 'logistics', 'variantList'],
    },
  },
  {
    name: 'disconnect_product',
    description: [
      '断开平台商品与CJ商品之间的连接关系，移除绑定。',
      '⚠️【敏感操作 - 需用户确认】断开连接后，该平台商品的订单将无法自动匹配到CJ商品进行履约。若不传 platformVariantId，将移除该平台商品的所有变体连接。',
      '触发场景：「断开商品连接」「取消商品绑定」「remove product connection」「disconnect product」。',
    ].join(' '),
    inputSchema: {
      type: 'object' as const,
      properties: {
        platformProductId: { type: 'string', description: '平台商品ID（必填）/ Platform product ID (required)' },
        shopId: { type: 'string', description: '店铺ID（可选）/ Shop ID (optional)' },
        platformVariantId: { type: 'string', description: '平台变体ID（可选，不填则移除该商品所有变体连接）/ Platform variant ID (optional, if empty removes all variants)' },
      },
      required: ['platformProductId'],
    },
  },
  {
    name: 'search_products_by_image',
    description: [
      '以图搜货：通过提供商品图片URL，在CJ商品目录中搜索视觉相似的商品。',
      '触发场景：「我有张图，帮我找类似商品」「以图搜货」「image search」「find similar products」。',
      '⚠️ 此API仅限白名单用户使用，非白名单用户调用会返回权限错误。',
      '参数 imageUrl 必填，建议使用清晰的商品主图URL。',
    ].join(' '),
    inputSchema: {
      type: 'object' as const,
      properties: {
        imageUrl: { type: 'string', description: '商品图片URL（必填，建议主图）/ Product image URL (required)' },
      },
      required: ['imageUrl'],
    },
  },
  {
    name: 'show_product_list',
    description:
      '【UI展示工具】在 MCP Apps 界面中以可视化卡片形式展示商品列表。\n' +
      '调用时机：当用户请求「展示商品列表」「以卡片形式显示商品」「打开商品列表界面」时调用此工具。\n' +
      '也可在 search_products 返回结果后主动调用此工具，以提供更直观的视觉展示。\n' +
      '界面支持：搜索、分页、点击商品跳转详情。\n' +
      '[UI tool] Show product list in visual card interface. Use after search_products to provide better visual experience.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        keyword: {
          type: 'string',
          description: '预填搜索关键词 / Pre-fill search keyword',
        },
      },
      required: [],
    },
    _meta: {
      ui: {
        resourceUri: 'ui://cj-mcp/product-list',
      },
    },
  },
  {
    name: 'show_product_detail',
    description:
      '【UI展示工具】在 MCP Apps 界面中以可视化方式展示单个商品详情，含图片、规格变体、价格、库存等。\n' +
      '调用时机：当用户请求「展示商品详情」「查看商品图片」「以界面显示商品」或在 get_product_detail 返回后主动调用时使用。\n' +
      '参数 pid 必填：传入商品 pid，界面将自动加载并展示商品信息。\n' +
      '[UI tool] Show single product detail with images and variants. Provide pid from get_product_detail result.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        pid: {
          type: 'string',
          description: '商品ID (pid)，必填 / Product ID (pid), required',
        },
      },
      required: ['pid'],
    },
    _meta: {
      ui: {
        resourceUri: 'ui://cj-mcp/product-detail',
      },
    },
  },
];

/**
 * MCP Apps UI 资源 URI 前缀（带查询参数的完整 URI）。
 * 用于所有工具的 _meta.ui.resourceUri，确保 Claude Desktop 识别每个工具都关联了 UI。
 * 实际 UI 渲染路径由 handleProductTool 中的 uiUri 参数控制。
 */
const PRODUCT_LIST_UI_URI = 'ui://cj-mcp/product-list';
const PRODUCT_DETAIL_UI_URI = 'ui://cj-mcp/product-detail';

/** module-level: 记录最近一次数据更新序列号，用于动态生成唯一 resourceUri */
let lastProductDetailPid = '';
let productUriSeq = 0;

/**
 * 动态工具列表：
 * - 所有工具（含 search_products / get_product_detail / show_product_list / show_product_detail）
 *   都注入 _meta.ui.resourceUri，确保 Claude Desktop 识别为 MCP Apps UI 工具
 * - readOnlyHint 仅注入只读工具（避免 ChatGPT 每次调用都弹确认框）
 */
const READ_ONLY_PRODUCT_TOOLS = new Set([
  'search_products', 'get_category_tree', 'get_warehouses', 'get_product_detail',
  'query_cj_inventory', 'get_my_products', 'get_product_variants',
  'query_sourcing', 'list_product_connections', 'get_product_reviews',
  'search_products_by_image',
]);

export function getProductTools(): Tool[] {
  const seq = ++productUriSeq;
  const ts = Date.now();
  return productTools.map(tool => {
    const isReadOnly = READ_ONLY_PRODUCT_TOOLS.has(tool.name);
    const annotations = isReadOnly ? { readOnlyHint: true } : undefined;
    // 只有展示工具（show_product_list / show_product_detail）才注入 _meta.ui.resourceUri，
    // 数据返回工具（search_products / get_product_detail 等）不应注入 _meta.ui，
    // 否则 MCP 客户端会在工具调用前就预渲染 UI（显示旧缓存数据），
    // 且同一个数据工具 + 展示工具会同时触发 UI 渲染导致重复显示两次。
    if (tool.name === 'show_product_list') {
      // @note 修改(第4次提交): 使用固定 URI（不加时间戳），ChatGPT 只需读取一次 HTML，
      // 后续通过 ui/notifications/tool-result 协议把数据推送到 iframe。
      return {
        ...tool,
        annotations,
        _meta: { ui: { resourceUri: PRODUCT_LIST_UI_URI } },
      };
    }
    if (tool.name === 'show_product_detail') {
      // @note 修改(第5次提交): 使用固定 URI（不加时间戳），ChatGPT 只需读取一次 HTML，
      // 后续通过 ui/notifications/tool-result 协议把数据推送到 iframe。
      return {
        ...tool,
        annotations,
        _meta: { ui: { resourceUri: PRODUCT_DETAIL_UI_URI } },
      };
    }
    // 数据返回工具不注入 _meta.ui，仅标注 readOnlyHint
    return { ...tool, annotations };
  });
}

/**
 * 工具返回类型：支持 text/resource content + _meta + structuredContent
 * @note 新增(第4次提交): 加入 structuredContent，供 show_product_list 通过 MCP Apps 协议把
 * 最新商品数据推送到 iframe，解决 ChatGPT 缓存 HTML 后 __INITIAL_DATA__ 不更新的问题。
 */
type ToolResult = { content: Array<Record<string, unknown>>; isError?: boolean; structuredContent?: Record<string, unknown>; _meta?: Record<string, unknown> };

export async function handleProductTool(
  name: string,
  args: Record<string, unknown>
): Promise<ToolResult> {
  // 检查登录态
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
      case 'search_products':
        return await handleSearchProducts(args);
      case 'get_category_tree':
        return await handleGetCategoryTree(args);
      case 'get_warehouses':
        return await handleGetWarehouses();
      case 'get_product_detail':
        return await handleGetProductDetail(args);
      case 'show_product_list': {
        // @note 新增(第4次提交): 通过 structuredContent 把最新商品数据推送给 iframe，
        // 解决 ChatGPT 缓存 HTML 后 window.__INITIAL_DATA__ 不更新的问题。
        // ChatGPT 在工具调用后会通过 ui/notifications/tool-result 把 structuredContent
        // 发给已完成 ui/initialize 握手的 iframe，UI 收到后重新渲染。
        const listData = getProductListCache();
        return {
          content: [{ type: 'text', text: '✅ 商品列表界面已打开 / Product list UI opened.' }],
          structuredContent: (listData ?? {}) as Record<string, unknown>,
          _meta: { ui: { resourceUri: PRODUCT_LIST_UI_URI } },
        };
      }
      case 'show_product_detail': {
        const pid = args.pid ? String(args.pid) : '';
        if (!pid) {
          return {
            content: [{ type: 'text', text: '❌ pid 必填 / pid is required.' }],
            isError: true,
          };
        }
        // 直接调用 API 获取数据并设置缓存（确保资源读取时数据已就绪）
        const detailResult = await handleGetProductDetail({ pid });
        if (detailResult.isError) {
          return detailResult;
        }
        // @note 新增(第5次提交): 通过 structuredContent 把最新商品详情数据推送给 iframe，
        // 解决 ChatGPT 缓存 HTML 后 window.__INITIAL_DATA__ 不更新的问题。
        const detailData = getProductDetailCache();
        return {
          content: [{ type: 'text', text: `✅ 商品详情界面已打开 / Product detail UI opened. pid: ${pid}` }],
          structuredContent: (detailData ?? {}) as Record<string, unknown>,
          _meta: { ui: { resourceUri: PRODUCT_DETAIL_UI_URI } },
        };
      }
      case 'query_cj_inventory':
        return await handleQueryCjInventory(args);
      case 'get_my_products':
        return await handleGetMyProducts(args);
      case 'get_product_variants':
        return await handleGetProductVariants(args);
      case 'create_sourcing':
        return await handleCreateSourcing(args);
      case 'query_sourcing':
        return await handleQuerySourcing(args);
      case 'list_product_connections':
        return await handleListProductConnections(args);
      case 'get_product_reviews':
        return await handleGetProductReviews(args);
      case 'create_product_connection':
        return await handleCreateProductConnection(args);
      case 'disconnect_product':
        return await handleDisconnectProduct(args);
      case 'search_products_by_image':
        return await handleSearchProductsByImage(args);
      default:
        return { content: [{ type: 'text', text: `Unknown product tool: ${name}` }], isError: true };
    }
  } catch (error: unknown) {
    if (error instanceof AuthExpiredError) {
      return {
        content: [{ type: 'text', text: error.message }],
        isError: true,
      };
    }
    const msg = error instanceof Error ? error.message : String(error);
    return { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true };
  }
}

async function handleSearchProducts(args: Record<string, unknown>) {
  /**
   * @note 纠正: product/listV2 是 GET 接口，参数通过 query string 传递
   * 原实现用 POST + body 导致 "Request method 'POST' not supported"
   * @note 纠正(77次): 搜索关键词参数应使用 keyWord（支持中英文），而非 productNameEn（仅英文）。
   * 修复前使用 productNameEn 导致中文搜索结果不准确。
   * @note 纠正(9次): 新增 countryCode/isWarehouse/addMarkStatus/productType/productFlag/sort/orderBy 参数，
   * 支持全球仓（isWarehouse=true）、国家过滤（countryCode=US）等场景；页面大小上限提升至100。
   */
  const params: Record<string, string> = {};
  if (args.keyword) params.keyWord = String(args.keyword);
  if (args.categoryId) params.categoryId = String(args.categoryId);
  if (args.countryCode) params.countryCode = String(args.countryCode);
  if (args.isWarehouse != null) params.isWarehouse = String(args.isWarehouse);
  if (args.minPrice != null) params.startSellPrice = String(args.minPrice);
  if (args.maxPrice != null) params.endSellPrice = String(args.maxPrice);
  if (args.addMarkStatus != null) params.addMarkStatus = String(args.addMarkStatus);
  // productType API 接受字符串如 "ORDINARY_PRODUCT"，也接受数字
  if (args.productType != null) params.productType = String(args.productType);
  if (args.productFlag != null) params.productFlag = String(args.productFlag);
  if (args.sort) params.sort = String(args.sort);
  if (args.orderBy != null) params.orderBy = String(args.orderBy);
  // 起始库存：默认 1（只搜索有库存商品），用户指定时取 max(用户值, 1)
  const userInventory = args.startWarehouseInventory != null ? Number(args.startWarehouseInventory) : 1;
  params.startWarehouseInventory = String(Math.max(userInventory, 1));
  // 新增参数：二级/三级类目列表
  if (Array.isArray(args.lv2categoryList) && args.lv2categoryList.length > 0) {
    params.lv2categoryList = (args.lv2categoryList as string[]).join(',');
  }
  if (Array.isArray(args.lv3categoryList) && args.lv3categoryList.length > 0) {
    params.lv3categoryList = (args.lv3categoryList as string[]).join(',');
  }
  // 新增参数：附加特性
  if (Array.isArray(args.features) && args.features.length > 0) {
    params.features = (args.features as string[]).join(',');
  }
  // 新增参数：专区平台
  if (args.zonePlatform) params.zonePlatform = String(args.zonePlatform);
  // 新增参数：供应商ID
  if (args.supplierId) params.supplierId = String(args.supplierId);
  // 新增参数：是否支持自提
  if (args.isSelfPickup != null) params.isSelfPickup = String(args.isSelfPickup);
  // 新增参数：是否有资质
  if (args.hasCertification != null) params.hasCertification = String(args.hasCertification);
  // 新增参数：上架时间区间
  if (args.timeStart) params.timeStart = String(args.timeStart);
  if (args.timeEnd) params.timeEnd = String(args.timeEnd);
  // 新增参数：结束库存、验证库存类型、是否定制
  if (args.endWarehouseInventory != null) params.endWarehouseInventory = String(args.endWarehouseInventory);
  if (args.verifiedWarehouse != null) params.verifiedWarehouse = String(args.verifiedWarehouse);
  if (args.customization != null) params.customization = String(args.customization);
  // 分页
  params.page = String((args.pageNum as number) || 1);
  params.size = String(Math.min((args.pageSize as number) || 20, 100));

  const response = await httpClient.request(ENDPOINTS.product.listV2, {
    method: 'GET',
    params,
    tier: 'read',
  });

  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `搜索失败 / Search failed: ${response.message}` }], isError: true };
  }

  /**
   * @note 纠正(73次): 为每个商品注入 productUrl 字段，格式与前端 getProductHref 一致。
   * @note 纠正(75次): API 响应结构为 data.content[].productList[]，字段为 id/nameEn，
   *   而非原先假设的 data.list[]（pid/productNameEn）。修复遍历路径和字段名。
   * 业务影响：AI 返回商品搜索结果时，用户可直接点击链接访问对应商品页面。
   */
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
          productUrl: getProductUrl(
            config.webBase,
            String(item.id || ''),
            String(item.nameEn || '')
          ),
        })),
      };
    });
  }

  const totalRecords = (response.data as Record<string, unknown> | null)?.totalRecords || 0;
  // 缓存数据供 UI 资源注入使用（MCP Apps 打开时通过 window.__INITIAL_DATA__ 获取数据）
  setProductListCache(response.data);

  return {
    content: [
      { type: 'text', text:
        `📋 Found ${totalRecords} products total.\n\n` +
        JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function handleGetCategoryTree(args: Record<string, unknown>) {
  /**
   * @note 纠正(16次): /category/getCategoryTree 不存在，实际API为 /product/getCategory (GET)
   */
  const params: Record<string, string> = {};
  if (args.parentId) params.parentId = String(args.parentId);

  const response = await httpClient.request(ENDPOINTS.product.getCategory, {
    method: 'GET',
    params,
    tier: 'read',
  });

  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `获取分类失败 / Get categories failed: ${response.message}` }], isError: true };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
  };
}

async function handleGetWarehouses() {
  const response = await httpClient.request(ENDPOINTS.product.globalWarehouseList, {
    method: 'GET',
    tier: 'read',
  });

  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `获取仓库失败 / Get warehouses failed: ${response.message}` }], isError: true };
  }

  return {
    content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
  };
}

async function handleGetProductDetail(args: Record<string, unknown>) {
  /**
   * @note 纠正(9次): 新增商品详情工具，对应 GET /v1/product/query。
   * 支持 pid/productSku/variantSku 三选一查询，支持 countryCode 过滤有库存的变体，
   * 支持 features（enable_combine/enable_video）附加字段。
   * 返回完整商品详情：名称、图片、价格、变体、库存、描述等，并注入 productUrl。
   */
  if (!args.pid && !args.productSku && !args.variantSku) {
    return {
      content: [{ type: 'text', text: '❌ 请至少传入 pid、productSku 或 variantSku 之一 / Please provide at least one of: pid, productSku, variantSku.' }],
      isError: true,
    };
  }

  const params: Record<string, string> = {};
  if (args.pid) params.pid = String(args.pid);
  if (args.productSku) params.productSku = String(args.productSku);
  if (args.variantSku) params.variantSku = String(args.variantSku);
  if (args.countryCode) params.countryCode = String(args.countryCode);
  if (args.features) params.features = String(args.features);

  const response = await httpClient.request(ENDPOINTS.product.query, {
    method: 'GET',
    params,
    tier: 'read',
  });

  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `获取商品详情失败 / Get product detail failed: ${response.message}` }], isError: true };
  }

  // 注入 productUrl，方便 AI 直接返回可点击链接
  const config = getEnvConfig();
  const data = response.data as Record<string, unknown> | null;
  if (data && data.pid) {
    const pid = String(data.pid);
    const name = String(data.productNameEn || '');
    (data as Record<string, unknown>).productUrl = getProductUrl(config.webBase, pid, name);
    // 更新最近查询的 pid，供动态 resourceUri 使用
    lastProductDetailPid = pid;
    // 缓存数据供 UI 资源注入使用（MCP Apps 打开时通过 window.__INITIAL_DATA__ 获取数据）
    setProductDetailCache(response.data);
  }

  return {
    content: [
      { type: 'text', text: `🔍 Product detail loaded.\n\n` + JSON.stringify(response.data, null, 2) },
    ],
  };
}

async function handleQueryCjInventory(args: Record<string, unknown>) {
  /**
   * @note 纠正(13次): 新增 query_cj_inventory 工具，查询 CJ 平台公开商品库存。
   * 支持三种查询方式：vid（变体ID）/sku（变体SKU/SPU）/pid（商品ID）三选一。
   * 对应三个不同 API 端点：queryByVid / queryBySku / getInventoryByPid。
   */
  if (!args.vid && !args.sku && !args.pid) {
    return {
      content: [{ type: 'text', text: '❌ 请提供 vid、sku 或 pid 中的任意一个参数 / Please provide one of: vid, sku, or pid.' }],
      isError: true,
    };
  }

  let endpoint: string;
  let params: Record<string, string>;

  if (args.vid) {
    endpoint = ENDPOINTS.product.stockQueryByVid;
    params = { vid: String(args.vid) };
  } else if (args.sku) {
    endpoint = ENDPOINTS.product.stockQueryBySku;
    params = { sku: String(args.sku) };
  } else {
    endpoint = ENDPOINTS.product.stockGetInventoryByPid;
    params = { pid: String(args.pid) };
  }

  const response = await httpClient.request(endpoint, { method: 'GET', params, tier: 'read' });
  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `库存查询失败 / Inventory query failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

async function handleGetMyProducts(args: Record<string, unknown>) {
  /**
   * @note 纠正(13次): 新增 get_my_products 工具，对应 GET /product/myProduct/query。
   * 查询用户已添加到「我的商品」选品列表，不同于全量搜索。
   */
  const params: Record<string, string> = {};
  if (args.keyword) params.keyword = String(args.keyword);
  if (args.categoryId) params.categoryId = String(args.categoryId);
  if (args.startAt) params.startAt = String(args.startAt);
  if (args.endAt) params.endAt = String(args.endAt);
  if (args.isListed !== undefined) params.isListed = String(args.isListed);
  if (args.visiable !== undefined) params.visiable = String(args.visiable);
  if (args.hasPacked !== undefined) params.hasPacked = String(args.hasPacked);
  if (args.hasVirPacked !== undefined) params.hasVirPacked = String(args.hasVirPacked);
  params.pageNum = String(Number(args.pageNum) || 1);
  const pageSize = Math.min(Number(args.pageSize) || 20, 200);
  params.pageSize = String(pageSize);

  const response = await httpClient.request(ENDPOINTS.product.myProductQuery, { method: 'GET', params, tier: 'read' });
  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `查询我的商品失败 / Get my products failed: ${response.message}` }], isError: true };
  }

  const config = getEnvConfig();
  const data = response.data as { content?: Array<Record<string, unknown>> } | null;
  if (data?.content && Array.isArray(data.content)) {
    data.content.forEach(item => {
      const pid = String(item.productId || '');
      const name = String(item.nameEn || '');
      if (pid) item.productUrl = getProductUrl(config.webBase, pid, name);
    });
  }
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

async function handleGetProductVariants(args: Record<string, unknown>) {
  /**
   * @note 纠正(13次): 新增 get_product_variants 工具，对应 GET /product/variant/query。
   * 查询商品的所有变体（颜色/尺码/规格），pid/productSku/variantSku 三选一。
   */
  if (!args.pid && !args.productSku && !args.variantSku) {
    return {
      content: [{ type: 'text', text: '❌ 请提供 pid、productSku 或 variantSku 中的任意一个 / Please provide pid, productSku, or variantSku.' }],
      isError: true,
    };
  }
  const params: Record<string, string> = {};
  if (args.pid) params.pid = String(args.pid);
  if (args.productSku) params.productSku = String(args.productSku);
  if (args.variantSku) params.variantSku = String(args.variantSku);
  if (args.countryCode) params.countryCode = String(args.countryCode);

  const response = await httpClient.request(ENDPOINTS.product.variantQuery, { method: 'GET', params, tier: 'read' });
  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `查询变体失败 / Get variants failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

async function handleCreateSourcing(args: Record<string, unknown>) {
  /**
   * @note 新增(第14次): create_sourcing，POST /product/sourcing/create。
   * productName 和 productImage 为必填，其余选填。
   * 返回 cjSourcingId 供后续 query_sourcing 查询。
   */
  if (!args.productName || !args.productImage) {
    return {
      content: [{ type: 'text', text: '❌ 请提供 productName 和 productImage / Please provide productName and productImage.' }],
      isError: true,
    };
  }
  const body: Record<string, unknown> = {
    productName: String(args.productName),
    productImage: String(args.productImage),
  };
  if (args.productUrl) body.productUrl = String(args.productUrl);
  if (args.remark) body.remark = String(args.remark);
  if (args.price) body.price = String(args.price);
  if (args.thirdProductId) body.thirdProductId = String(args.thirdProductId);
  if (args.thirdVariantId) body.thirdVariantId = String(args.thirdVariantId);
  if (args.thirdProductSku) body.thirdProductSku = String(args.thirdProductSku);

  const response = await httpClient.request(ENDPOINTS.product.sourcingCreate, { body, tier: 'write' });
  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `创建采购需求失败 / Create sourcing failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: 'text', text: `✅ 采购需求已提交 / Sourcing request submitted:\n${JSON.stringify(response.data, null, 2)}` }] };
}

async function handleQuerySourcing(args: Record<string, unknown>) {
  /**
   * @note 新增(第14次): query_sourcing，POST /product/sourcing/query。
   * 支持按 IDs 精确查询，也支持按状态筛选+分页列表。
   */
  const body: Record<string, unknown> = {};
  if (Array.isArray(args.sourceIds) && args.sourceIds.length > 0) {
    body.sourceIds = args.sourceIds;
  }
  if (Array.isArray(args.sourceStatuses) && args.sourceStatuses.length > 0) {
    body.sourceStatuses = args.sourceStatuses;
  }
  if (args.pageNum != null) body.pageNum = Number(args.pageNum);
  if (args.pageSize != null) body.pageSize = Math.min(Number(args.pageSize) || 20, 100);

  const response = await httpClient.request(ENDPOINTS.product.sourcingQuery, {
    body,
    tier: 'read',
  });
  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `查询采购需求失败 / Query sourcing failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

async function handleListProductConnections(args: Record<string, unknown>) {
  /**
   * @note 新增(第14次): list_product_connections，GET /product/conn/connection。
   * 查询店铺商品连接记录列表，支持多种筛选条件。
   */
  const params: Record<string, string> = {};
  if (args.shopId) params.shopId = String(args.shopId);
  if (args.platformProductId) params.platformProductId = String(args.platformProductId);
  if (args.platformVariantId) params.platformVariantId = String(args.platformVariantId);
  params.page = String(args.page || 1);
  params.pageSize = String(Math.min(Number(args.pageSize) || 10, 100));

  const response = await httpClient.request(ENDPOINTS.product.connList, { method: 'GET', params, tier: 'read' });
  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `查询商品连接失败 / List connections failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

async function handleGetProductReviews(args: Record<string, unknown>) {
  /**
   * @note 新增(第14次): get_product_reviews，GET /product/productComments（v2新版接口）。
   * pid 为必填，score 可按评分筛选，支持分页。
   */
  if (!args.pid) {
    return {
      content: [{ type: 'text', text: '❌ 请提供 pid（商品ID）/ Please provide pid (product ID).' }],
      isError: true,
    };
  }
  const params: Record<string, string> = { pid: String(args.pid) };
  if (args.score) params.score = String(args.score);
  params.pageNum = String(args.pageNum || 1);
  params.pageSize = String(Math.min(Number(args.pageSize) || 20, 50));

  const response = await httpClient.request(ENDPOINTS.product.productComments, { method: 'GET', params, tier: 'read' });
  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `查询评价失败 / Get reviews failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

async function handleCreateProductConnection(args: Record<string, unknown>) {
  /**
   * @note 新增(第15次): create_product_connection，POST /product/conn/connection。
   * ⚠️ 敏感操作：建立CJ商品与平台商品的绑定关系，影响订单自动匹配。
   */
  if (!args.cjProductId || !args.platformProductId || args.defaultArea === undefined || !args.logistics || !Array.isArray(args.variantList) || args.variantList.length === 0) {
    return {
      content: [{ type: 'text', text: '❌ 请提供 cjProductId、platformProductId、defaultArea、logistics 和 variantList（至少一项）/ Please provide required params.' }],
      isError: true,
    };
  }
  const body: Record<string, unknown> = {
    cjProductId: String(args.cjProductId),
    platformProductId: String(args.platformProductId),
    defaultArea: Number(args.defaultArea),
    logistics: String(args.logistics),
    variantList: args.variantList,
  };
  if (args.shopId) body.shopId = String(args.shopId);
  if (args.sourceCountryCode) body.sourceCountryCode = String(args.sourceCountryCode);
  if (args.targetCountryCode) body.targetCountryCode = String(args.targetCountryCode);

  const response = await httpClient.request(ENDPOINTS.product.connList, { body, tier: 'write' });
  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `创建商品连接失败 / Create product connection failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: 'text', text: `✅ 商品连接已建立 / Product connection created.\n${JSON.stringify(response.data, null, 2)}` }] };
}

async function handleDisconnectProduct(args: Record<string, unknown>) {
  /**
   * @note 新增(第15次): disconnect_product，DELETE /product/conn/connection。
   * ⚠️ 敏感操作：断开CJ商品与平台商品绑定，影响订单自动匹配。
   */
  if (!args.platformProductId) {
    return {
      content: [{ type: 'text', text: '❌ 请提供 platformProductId / Please provide platformProductId.' }],
      isError: true,
    };
  }
  const params: Record<string, string> = {
    platformProductId: String(args.platformProductId),
  };
  if (args.shopId) params.shopId = String(args.shopId);
  if (args.platformVariantId) params.platformVariantId = String(args.platformVariantId);

  const response = await httpClient.request(ENDPOINTS.product.connList, { method: 'DELETE', params, tier: 'write' });
  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `断开商品连接失败 / Disconnect product failed: ${response.message}` }], isError: true };
  }
  return { content: [{ type: 'text', text: `✅ 商品连接已断开 / Product disconnected.\n${JSON.stringify(response.data, null, 2)}` }] };
}

async function handleSearchProductsByImage(args: Record<string, unknown>) {
  /**
   * @note 新增(第15次): search_products_by_image，POST /product/queryProductsByImage。
   * ⚠️ 此API仅限白名单用户，非白名单账户会返回权限错误。
   */
  if (!args.imageUrl) {
    return {
      content: [{ type: 'text', text: '❌ 请提供 imageUrl / Please provide imageUrl.' }],
      isError: true,
    };
  }
  const response = await httpClient.request(ENDPOINTS.product.imageSearch, {
    body: { imageUrl: String(args.imageUrl) },
    tier: 'read',
  });
  if (!isApiSuccess(response)) {
    return { content: [{ type: 'text', text: `以图搜货失败 / Image search failed: ${response.message}\n⚠️ 如果是权限错误，此API需要申请白名单才可使用 / If permission error, this API requires whitelist access.` }], isError: true };
  }
  return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
}

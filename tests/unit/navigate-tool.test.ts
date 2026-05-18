/**
 * @fileoverview Navigate Tools 单元测试
 */
import { describe, it, expect, vi } from 'vitest';
import { handleNavigateTool } from '../../src/mcp-server/tools/navigate.tool';

vi.mock('../../src/config/env', () => ({
  getEnvConfig: () => ({
    env: 'test',
    openApiBase: 'http://test002.cjdropshipping.offline.pre.com',
    webBase: 'http://www.cjdropshipping.offline.pre.com',
    loginApiBase: 'http://www.cjdropshipping.offline.pre.com',
    platform: 1,
    language: 'en',
    currency: 'USD',
    tokenEncryptKey: '',
  }),
}));

describe('navigate.tool', () => {
  /**
   * @note 纠正(73次): open_order_page 改用 getProductHref 格式生成商品链接，
   * 原格式 /product/detail/${id} 已废弃，新格式 /product/${name}-p-${id}.html 与前端一致。
   * 断言失败说明链接格式未与前端同步，用户点击后可能无法访问商品页面。
   */
  it('open_order_page 生成 getProductHref 格式下单链接（含 SEO 友好 URL）', async () => {
    const result = await handleNavigateTool('open_order_page', {
      productId: 'P123',
      productName: 'Test Product',
    });
    expect(result.content[0].text).toContain('/product/test-product-p-P123.html');
  });

  it('open_order_page 无 productName 时降级为 /product/-p-${id}.html', async () => {
    const result = await handleNavigateTool('open_order_page', { productId: 'P123' });
    expect(result.content[0].text).toContain('/product/-p-P123.html');
  });

  it('open_order_page 带 variantId', async () => {
    const result = await handleNavigateTool('open_order_page', { productId: 'P123', variantId: 'V456' });
    expect(result.content[0].text).toContain('?vid=V456');
  });

  /**
   * @note 纠正(74次): 验证商品链接使用 config.webBase 环境变量，不硬编码域名。
   * 断言失败说明链接使用了错误的域名（如测试时出现线上域名），导致用户无法访问正确环境。
   */
  it('open_order_page 链接使用 mock webBase（环境适配验证，禁止硬编码线上域名）', async () => {
    const result = await handleNavigateTool('open_order_page', {
      productId: 'P123',
      productName: 'Test',
    });
    // 链接包含测试环境域名
    expect(result.content[0].text).toContain('http://www.cjdropshipping.offline.pre.com');
    // 不含硬编码的线上域名
    expect(result.content[0].text).not.toContain('https://www.cjdropshipping.com');
  });

  /**
   * @note 纠正(75次): open_listing_page 改为生成商品详情页 + ?list=1，与前端 use-eidt-list.ts
   * useEffect 自动触发刊登弹窗的逻辑对齐。断言失败说明 MCP 生成的链接无法触发前端刊登弹窗。
   */
  it('open_listing_page 生成商品详情页 + ?list=1 刊登链接（含 productName）', async () => {
    const result = await handleNavigateTool('open_listing_page', {
      productId: 'P789',
      productName: 'Cool Widget',
    });
    expect(result.content[0].text).toContain('/product/cool-widget-p-P789.html?list=1');
  });

  it('open_listing_page 无 productName 时降级为 /product/-p-${id}.html?list=1', async () => {
    const result = await handleNavigateTool('open_listing_page', { productId: 'P789' });
    expect(result.content[0].text).toContain('/product/-p-P789.html?list=1');
  });

  /**
   * @note 纠正(75次): open_product_connect_page 改为生成商品详情页 + ?connect=1，
   * 与 mf-components use-connect.ts 新增的 useEffect 检测逻辑对齐。
   * 断言失败说明 MCP 生成的链接无法触发前端连接弹窗，用户须手动点击按钮。
   */
  it('open_product_connect_page 生成商品详情页 + ?connect=1 连接链接（含 productName）', async () => {
    const result = await handleNavigateTool('open_product_connect_page', {
      productId: 'P789',
      productName: 'Cool Widget',
    });
    expect(result.content[0].text).toContain('/product/cool-widget-p-P789.html?connect=1');
  });

  it('open_product_connect_page 无 productName 时降级为 /product/-p-${id}.html?connect=1', async () => {
    const result = await handleNavigateTool('open_product_connect_page', { productId: 'P789' });
    expect(result.content[0].text).toContain('/product/-p-P789.html?connect=1');
  });

  /**
   * @note 纠正(76次): 验证 open_product_connect_page 缺少 productId 时返回友好错误提示，
   * 引导 AI 先调用 search_products。断言失败说明防御检查失效，AI 会生成含 undefined 的无效链接。
   */
  it('open_product_connect_page 缺少 productId 返回错误提示', async () => {
    const result = await handleNavigateTool('open_product_connect_page', {});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('search_products');
  });

  it('open_shopping_cart 生成购物车链接', async () => {
    const result = await handleNavigateTool('open_shopping_cart', {});
    expect(result.content[0].text).toContain('/myCJ.html#/shoppingCart');
  });

  it('未知 tool 返回错误', async () => {
    const result = await handleNavigateTool('unknown_tool', {});
    expect(result.isError).toBe(true);
  });
});

/**
 * @fileoverview 商品链接生成工具函数
 * @note 纠正(73次): MCP 中所有商品链接统一使用 getProductHref 格式，
 * 与前端 mycj-react getProductHref 函数保持一致，确保链接可访问。
 * 原始实现参考：mycj-react/src/utils/getProductHref.ts
 *
 * 格式：/product/${urlQueryFormat(name)}-p-${id}.html
 * 示例：/product/double-layer-chiffon-wide-leg-pants-nine-point-hakama-p-038DE737-0136-41A9-AAE1-91E866149536.html
 */

/**
 * 格式化 URL 片段
 * @param name - 商品英文名
 * @param encode - 是否 encodeURIComponent，默认 true
 * @returns 格式化后的 URL 片段
 *
 * 规则（与前端一致）：
 * 1. 全小写
 * 2. 去除逗号
 * 3. 去除空格 + & 组合（" &" → ""）
 * 4. 去除单引号
 * 5. 去除问号
 * 6. 空格转 -
 * 7. encodeURIComponent 编码
 */
export function urlQueryFormat(name: string, encode = true): string {
  let url = String(name).toLocaleLowerCase();
  url = url.replace(/,/g, '');
  url = url.replace(/( )?&/g, '');
  url = url.replace(/'/g, '');
  url = url.replace(/\?/g, '');
  url = url.replace(/ /g, '-');
  return encode ? encodeURIComponent(url) : decodeURIComponent(url);
}

/**
 * 获取商品详情页路径（不含域名）
 * @param id - 商品 ID（pid）
 * @param name - 商品英文名（productNameEn），默认空字符串
 * @returns 商品详情页相对路径，例：/product/phone-case-p-ABC123.html
 */
export function getProductHref(id: string, name = ''): string {
  return `/product/${urlQueryFormat(name)}-p-${id}.html`;
}

/**
 * 获取商品详情页完整 URL
 * @param baseUrl - 域名，如 https://www.cjdropshipping.com
 * @param id - 商品 ID（pid）
 * @param name - 商品英文名（productNameEn），默认空字符串
 * @returns 商品详情页完整 URL
 */
export function getProductUrl(baseUrl: string, id: string, name = ''): string {
  return `${baseUrl}${getProductHref(id, name)}`;
}

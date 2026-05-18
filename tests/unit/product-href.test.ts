/**
 * @fileoverview getProductHref 工具函数单元测试
 * @note 纠正(73次): MCP 中所有商品链接统一使用 getProductHref 格式，
 * 与前端 mycj-react/src/utils/getProductHref 保持一致。
 * 格式：/product/${urlQueryFormat(name)}-p-${id}.html
 */
import { describe, it, expect } from 'vitest';
import { urlQueryFormat, getProductHref } from '../../src/utils/product-href';

describe('urlQueryFormat', () => {
  it('名称全小写、空格转-', () => {
    expect(urlQueryFormat('Phone Case')).toBe('phone-case');
  });

  it('去除逗号', () => {
    expect(urlQueryFormat('case, black')).toBe('case-black');
  });

  it('去除单引号', () => {
    expect(urlQueryFormat("men's shirt")).toBe('mens-shirt');
  });

  it('去除问号', () => {
    expect(urlQueryFormat('what? item')).toBe('what-item');
  });

  it('去除 & 及前置空格', () => {
    expect(urlQueryFormat('shirt & pants')).toBe('shirt-pants');
  });

  it('生产环境示例 — 与前端保持一致', () => {
    // 对应示例: double-layer-chiffon-wide-leg-pants-nine-point-hakama
    expect(urlQueryFormat('Double-layer Chiffon Wide-leg Pants Nine-point Hakama'))
      .toBe('double-layer-chiffon-wide-leg-pants-nine-point-hakama');
  });

  it('空名称返回空字符串', () => {
    expect(urlQueryFormat('')).toBe('');
  });
});

describe('getProductHref', () => {
  it('生成正确格式的商品路径', () => {
    const result = getProductHref(
      '038DE737-0136-41A9-AAE1-91E866149536',
      'Double-layer Chiffon Wide-leg Pants Nine-point Hakama'
    );
    expect(result).toBe(
      '/product/double-layer-chiffon-wide-leg-pants-nine-point-hakama-p-038DE737-0136-41A9-AAE1-91E866149536.html'
    );
  });

  it('名称为空时也能生成合法路径', () => {
    const result = getProductHref('ABC123', '');
    expect(result).toBe('/product/-p-ABC123.html');
  });

  it('ID 中的大写字母保持不变', () => {
    const result = getProductHref('UPPER-CASE-ID', 'test product');
    expect(result).toContain('UPPER-CASE-ID');
    expect(result).toContain('test-product');
  });
});

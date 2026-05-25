import { existsSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import {
  getProjectRoot,
  readUiHtmlFile,
  resolveUiHtmlPath,
} from '../../src/utils/module-path.js';

describe('module-path', () => {
  it('getProjectRoot 指向含 package.json 的项目根', () => {
    const root = getProjectRoot();
    expect(existsSync(join(root, 'package.json'))).toBe(true);
  });

  it('resolveUiHtmlPath 能定位 login.html', () => {
    const path = resolveUiHtmlPath('login.html');
    expect(existsSync(path)).toBe(true);
    expect(path).toMatch(/src[/\\]ui[/\\]login\.html$/);
  });

  it('readUiHtmlFile 返回有效 HTML', () => {
    const html = readUiHtmlFile('login.html');
    expect(html).toContain('<!DOCTYPE html>');
  });
});

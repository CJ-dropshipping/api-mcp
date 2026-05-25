/**
 * @fileoverview 运行时目录与项目路径解析
 * 不依赖 import.meta，避免 esbuild CJS 打包时的 empty-import-meta 警告。
 *
 * 解析顺序：
 * 1. __dirname — node dist/*.cjs、Vitest 等 CJS 上下文
 * 2. process.argv[1] — tsx / node 启动的入口脚本路径（如 src/mcp-server/index.ts）
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

/** 当前 MCP 运行时目录（入口脚本所在目录或当前模块目录） */
export function getRuntimeDir(): string {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }

  const entry = process.argv[1];
  if (entry) {
    return dirname(fileURLToPath(pathToFileURL(resolve(entry))));
  }

  throw new Error(
    'Cannot resolve MCP runtime directory: __dirname unavailable and process.argv[1] is empty',
  );
}

/** 项目根目录（含 package.json） */
export function getProjectRoot(): string {
  const runtimeDir = getRuntimeDir();
  const candidates = [
    join(runtimeDir, '..', '..'),
    join(runtimeDir, '..'),
    process.cwd(),
  ];
  for (const dir of candidates) {
    if (existsSync(join(dir, 'package.json'))) {
      return dir;
    }
  }
  return process.cwd();
}

/** 解析 MCP UI HTML 文件绝对路径 */
export function resolveUiHtmlPath(filename: string): string {
  const candidates = [
    join(getProjectRoot(), 'src', 'ui', filename),
    join(process.cwd(), 'src', 'ui', filename),
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      return path;
    }
  }
  throw new Error(
    `UI HTML not found: ${filename}. Tried: ${candidates.join(', ')}`,
  );
}

/** 读取 MCP UI HTML 文件内容 */
export function readUiHtmlFile(filename: string): string {
  return readFileSync(resolveUiHtmlPath(filename), 'utf-8');
}

/** 项目 logs 目录 */
export function getLogsDir(): string {
  return join(getProjectRoot(), 'logs');
}

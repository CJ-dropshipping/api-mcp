import { build } from 'esbuild';

// MCP Server (stdio)
build({
  entryPoints: ['src/mcp-server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/mcp-server/index.cjs',
  format: 'cjs',
  sourcemap: true,
}).catch(() => process.exit(1));

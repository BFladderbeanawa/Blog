import { defineConfig } from 'vite-plus';

// Next.js owns serving and bundling. Invoke its package scripts with vp run.
const ignorePatterns = [
  '.next/**',
  '.vercel/**',
  '.astro/**',
  '.agents/**',
  '.claude/**',
  '.codegraph/**',
  '.extract-design-system/**',
  '.omo/**',
  '.playwright-mcp/**',
  '.vite-hooks/**',
  '.vite-cache/**',
  '.vite-cache-codex/**',
  'dist/**',
  'node_modules/**',
  'public/**',
  'src/assets/**',
  'src/content/**',
  'next-env.d.ts',
  'pnpm-lock.yaml',
  'skills-lock.json',
  'temp.txt',
  'dev*.log',
  '**/*.log',
  '**/*.md',
];

export default defineConfig({
  fmt: {
    singleQuote: true,
    ignorePatterns,
  },
  lint: {
    ignorePatterns,
  },
  staged: {
    '*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}': 'vp check --fix',
  },
});

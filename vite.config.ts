// Vite+ owns the JavaScript surface of this repo: Oxfmt and Oxlint run over
// config, endpoint and tooling modules. Astro components are compiled by Astro
// itself, so `.astro` is out of scope for both tools — Oxfmt does not parse SFCs
// and linting the frontmatter needs the Astro compiler. `astro check` covers
// those files instead.
//
// `vp dev` / `vp build` are intentionally unused: Astro owns the dev server and
// the production build. Vite+ provides lint, format, test and task running
// around them.
import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: {
    singleQuote: true,
    // Prose and vendored skill definitions are left alone: the formatter
    // would reflow blog posts and rewrite third-party markdown.
    ignorePatterns: [
      '.agents/**',
      '.astro/**',
      '.vite-cache/**',
      '.vite-cache-codex/**',
      'dist/**',
      'node_modules/**',
      'public/**',
      'src/content/**',
      '**/*.md',
      '**/*.mdx',
    ],
  },
  lint: {
    ignorePatterns: [
      '.agents/**',
      '.codegraph/**',
      '.extract-design-system/**',
      '.playwright-mcp/**',
      '.vite-cache/**',
      '.vite-cache-codex/**',
      'dist/**',
      'node_modules/**',
      'public/**',
    ],
  },
  staged: {
    '*.{js,cjs,mjs,ts,cts,mts}': 'vp check --fix',
  },
});

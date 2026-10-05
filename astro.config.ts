import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://bfladderbean.me',

  // Astro 7 changed compressHTML from true to 'jsx', which strips the
  // whitespace between sibling elements using JSX rules. The design leans on
  // inline spans for labels and stats (`LAT <b>31.23</b> // LON ...`), so the
  // new default would glue words together on every page. Keep the v6
  // behaviour; moving to 'jsx' means auditing each template for `{" "}`.
  compressHTML: true,

  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },

  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'nord',
      },
    },
  },

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    imageService: true,
  }),
});

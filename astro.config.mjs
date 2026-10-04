// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  site: 'https://bfladderbean.me',
  // Astro 7 changed compressHTML from true to 'jsx', which strips the
  // whitespace between sibling elements using JSX rules. The design leans on
  // inline spans for labels and stats (`LAT <b>31.23</b> // LON ...`), so the
  // new default would glue words together on every page. Keep the v6
  // behaviour; moving to 'jsx' means auditing each template for `{" "}`.
  compressHTML: true,
  markdown: {
    // Astro 7 renders Markdown with Sätteri by default. remark-math and
    // rehype-katex are unified plugins, so the LaTeX posts stay on the
    // unified pipeline until they are ported to Sätteri plugins.
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
});

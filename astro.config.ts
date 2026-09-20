import { defineConfig } from "astro/config"
import { unified } from "@astrojs/markdown-remark"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

import vercel from "@astrojs/vercel"

// https://astro.build/config
export default defineConfig({
  site: "https://bfladderbean.me",

  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "nord",
      },
    },
  },

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    imageService: true,
  }),
})

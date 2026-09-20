import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { unified } from "@astrojs/markdown-remark"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

import vercel from "@astrojs/vercel"

// https://astro.build/config
export default defineConfig({
  site: "https://bfladderbean.me",

  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve("./src"),
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

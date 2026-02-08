# BFladderbean's Digital Garden

一个基于 [Astro](https://astro.build) 构建的现代化、高性能个人博客。

## 核心特性 (Key Features)

### 1. **App Shell 布局**
采用类似原生应用的布局策略。
- **固定框架**：Header 和 Footer 固定在视口上下方。
- **独立滚动**：中间内容区域独立滚动，避免了页面切换时的整体跳动，提供沉浸式阅读体验。

### 2. **日夜双主题系统**
- **Modern Day (浅色)**：瑞士平面设计风格 (\font-weight: 900\, \
adius: 0\)，强调排版和留白。
- **Nord Night (深色)**：基于 Nord 配色的舒适夜间模式，增加圆角 (\
adius: 8px\)，降低对比度刺激。
- **智能切换**：自动检测系统偏好，支持手动切换并持久化存储。

### 3. **多维视图模式**
在文章列表页支持两种浏览模式，带平滑过渡动画：
- **详细视图 (Expanded)**：展示封面大图、摘要、标签和完整元数据。
- **紧凑视图 (Compact)**：高效列表模式，适合快速浏览归档。

### 4. **新访客指引 (Start Here)**
- 专为首次访问者设计的 \/start-here\ 页面。
- 包含“认识博主”、“核心技术”、“随笔思考”的阅读路线图。
- **自定义精选**：通过 \src/featured-posts.json\ 灵活控制展示的推荐文章。

### 5. **交互细节**
- **Crimson Flow 按钮**：无阴影的高级感流光交互。
- **Hollow Numbers**：建议路径卡片采用镂空数字背景，兼顾质感与可读性。
- **Sticky Blur Nav**：文章列表页的次级导航栏支持吸顶效果。

## 项目架构 (Project Architecture)

本项目遵循 Astro 的 **Islands Architecture** 思想，结合了 SSG (静态站点生成) 的优势。

### 目录结构

\\\	ext
/
├── public/              # 静态资源
├── src/
│   ├── components/      # UI 组件 (Header, Footer, PostCard, BlogNav...)
│   ├── content/         # 内容集合
│   │   └── blog/        # Markdown/MDX 博客文章源文件
│   ├── layouts/         # 页面布局模板 (App Shell 核心)
│   ├── pages/           # 路由页面
│   │   ├── index.astro  # 首页
│   │   ├── blog/        # 文章列表与详情
│   │   ├── start-here.astro # 指引页
│   │   └── ...
│   └── featured-posts.json # [配置] 首页/指引页的精选文章列表
├── astro.config.mjs     # Astro 配置文件
└── package.json
\\\

### 关键技术点

1.  **Content Collections**: 使用 Astro 的 Content Collections API 管理博客文章，提供类型安全的前端数据查询。
2.  **CSS Custom Properties**: 利用 CSS 变量实现主题切换。通过 \:root\ 和 \[data-theme='nord']\ 选择器动态改变颜色、圆角、阴影等设计令牌。
3.  **Client-Side Scripting**: 
    - 使用轻量级 Vanilla JS 处理视图切换 (\localStorage\)、主题切换和移动端菜单，无繁重框架依赖。
    - 针对 FOUC (Flash of Unstyled Content) 做了专门优化。

## 🛠️ 使用指南

### 安装依赖

\\\bash
npm install
\\\

### 本地开发

\\\bash
npm run dev
\\\

### 新建文章

在 \src/content/blog/\ 目录下创建 \.md\ 或 \.mdx\ 文件。Frontmatter 格式如下：

\\\yaml
---
title: '文章标题'
description: '文章简介...'
pubDate: '2024-02-08'
heroImage: '/img/cover.jpg'
category: 'Tech'
tags: ['Astro', 'Web']
---
\\\

### 配置精选文章

编辑 \src/featured-posts.json\ 文件，填入文章的文件名（Slug）：

\\\json
[
  "hello-world",
  "my-best-article"
]
\\\

## License

MIT

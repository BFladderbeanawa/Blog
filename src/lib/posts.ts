import 'server-only';

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';
import matter from 'gray-matter';
import type { GrayMatterFile } from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

export type Post = {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  updatedDate?: string;
  heroImage?: string;
  content: string;
  frontmatter: Record<string, unknown>;
};

export type PostHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

function textContent(node: HastNode): string {
  if (node.type === 'text') return node.value ?? '';
  return node.children?.map(textContent).join('') ?? '';
}

// rehype-slug has already assigned ids by the time this runs. Collecting the
// headings here keeps the table of contents and the rendered anchors in sync.
function rehypeCollectHeadings() {
  return (tree: unknown, file: { data: Record<string, unknown> }) => {
    const headings: PostHeading[] = [];
    const visit = (node: HastNode) => {
      if (node.type === 'element' && (node.tagName === 'h2' || node.tagName === 'h3')) {
        const id = node.properties?.id;
        const text = textContent(node).replace(/\s+/g, ' ').trim();
        if (typeof id === 'string' && text) {
          headings.push({ id, text, level: node.tagName === 'h2' ? 2 : 3 });
        }
      }
      node.children?.forEach(visit);
    };
    visit(tree as HastNode);
    file.data.headings = headings;
  };
}

const contentDirectory = path.join(process.cwd(), 'src', 'content', 'blog');

const markdown = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype)
  .use(rehypeKatex, { macros: { '\\R': '\\mathbb{R}' } })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
  .use(rehypeHighlight)
  .use(rehypeCollectHeadings)
  .use(rehypeStringify)
  .freeze();

function invalidFrontmatter(filename: string, detail: string): never {
  throw new Error(`Invalid frontmatter in ${filename}: ${detail}`);
}

function requiredString(
  frontmatter: Record<string, unknown>,
  field: string,
  filename: string,
): string {
  const value = frontmatter[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    return invalidFrontmatter(filename, `${field} must be a non-empty string`);
  }
  return value;
}

function dateString(value: unknown, field: string, filename: string): string {
  if (value instanceof Date) {
    if (!Number.isNaN(value.getTime())) return value.toISOString();
  } else if (typeof value === 'string') {
    // Require an ISO date, optionally followed by a timezone-qualified time.
    const match =
      /^(\d{4}-\d{2}-\d{2})(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.exec(value);
    if (match) {
      const day = new Date(`${match[1]}T00:00:00Z`);
      if (
        !Number.isNaN(day.getTime()) &&
        day.toISOString().slice(0, 10) === match[1] &&
        !Number.isNaN(Date.parse(value))
      ) {
        return value;
      }
    }
  }
  return invalidFrontmatter(filename, `${field} must be a valid ISO date`);
}

function parsePost(filename: string, source: string): Post {
  if (!/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(source)) {
    invalidFrontmatter(filename, 'a complete YAML frontmatter block is required');
  }

  let parsed: GrayMatterFile<string>;
  try {
    parsed = matter(source);
  } catch (error) {
    invalidFrontmatter(filename, error instanceof Error ? error.message : String(error));
  }

  const frontmatter: Record<string, unknown> = parsed.data;
  if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) {
    invalidFrontmatter(filename, 'metadata must be a mapping');
  }

  const title = requiredString(frontmatter, 'title', filename);
  const description = requiredString(frontmatter, 'description', filename);
  const pubDate = dateString(frontmatter.pubDate, 'pubDate', filename);
  const updatedDate =
    frontmatter.updatedDate === undefined
      ? undefined
      : dateString(frontmatter.updatedDate, 'updatedDate', filename);
  const heroImage =
    frontmatter.heroImage === undefined
      ? undefined
      : requiredString(frontmatter, 'heroImage', filename);

  if (
    frontmatter.tags !== undefined &&
    (!Array.isArray(frontmatter.tags) || frontmatter.tags.some((tag) => typeof tag !== 'string'))
  ) {
    invalidFrontmatter(filename, 'tags must be an array of strings');
  }
  if (frontmatter.category !== undefined && typeof frontmatter.category !== 'string') {
    invalidFrontmatter(filename, 'category must be a string');
  }

  return {
    slug: filename.slice(0, -3).trim().toLowerCase().replace(/\s+/g, '-'),
    title,
    description,
    pubDate,
    ...(updatedDate === undefined ? {} : { updatedDate }),
    ...(heroImage === undefined ? {} : { heroImage }),
    content: parsed.content,
    frontmatter,
  };
}

export const getPosts = cache(async (): Promise<Post[]> => {
  const entries = await readdir(contentDirectory, { withFileTypes: true });
  const filenames = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);
  const posts = await Promise.all(
    filenames.map(async (filename) =>
      parsePost(filename, await readFile(path.join(contentDirectory, filename), 'utf8')),
    ),
  );

  const slugs = new Set<string>();
  for (const post of posts) {
    if (!post.slug || slugs.has(post.slug)) {
      throw new Error(`Invalid or duplicate article slug: ${JSON.stringify(post.slug)}`);
    }
    slugs.add(post.slug);
  }

  return posts.sort(
    (left, right) =>
      Date.parse(right.pubDate) - Date.parse(left.pubDate) ||
      (left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0),
  );
});

export const getPost = cache(async (slug: string): Promise<Post | undefined> =>
  (await getPosts()).find((post) => post.slug === slug),
);

export const renderPost = cache(
  async (source: string): Promise<{ html: string; headings: PostHeading[] }> => {
    const file = await markdown.process(source);
    return {
      html: String(file),
      headings: (file.data.headings as PostHeading[] | undefined) ?? [],
    };
  },
);

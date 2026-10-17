import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/posts';
import { site } from '@/data/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = site.url;
  const routes = ['', '/about', '/contact', '/projects', '/friends', '/all'];
  const posts = await getPosts();

  return [
    ...routes.map((route) => ({ url: `${baseUrl}${route}` })),
    ...posts.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: post.updatedDate ?? post.pubDate,
    })),
  ];
}

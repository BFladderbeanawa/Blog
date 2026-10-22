import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { AllPostsIndex, type IndexPost } from '@/components/site/AllPostsIndex';
import { AllPostsPager } from '@/components/site/AllPostsPager';
import { getPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'All Posts',
  description: 'The complete archive of writing, development notes, and study notes.',
  alternates: { canonical: '/all' },
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

// Horizontal bands of the portrait re-cut and pushed sideways (percent of the panel).
const slices = [
  { top: 22, height: 4, shift: -3 },
  { top: 47, height: 1.8, shift: 2.4 },
  { top: 63, height: 6, shift: -1.4 },
];

export default async function AllPostsPage() {
  const posts = await getPosts();
  const indexPosts: IndexPost[] = await Promise.all(
    posts.map(async (post, index) => ({
      slug: post.slug,
      number: String(posts.length - index).padStart(2, '0'),
      title: post.title,
      description: post.description,
      pubDate: post.pubDate,
      date: dateFormatter.format(new Date(post.pubDate)),
      tags: post.tags,
      // Each Markdown file selects its image at runtime; a static import cannot select it.
      cover: post.heroImage
        ? post.heroImage.startsWith('/')
          ? post.heroImage
          : (await import(`@/assets/${post.heroImage}`)).default
        : undefined,
    })),
  );

  return (
    <main id="main-content" className="all-page" aria-labelledby="all-heading">
      <AllPostsPager />
      <section className="all-hero" data-all-page>
        <span className="all-block all-block-blush" aria-hidden="true" />
        <span className="all-block all-block-sky" aria-hidden="true" />

        <h1 id="all-heading" className="all-title">
          <span className="all-title-row">All</span>
          <span className="all-title-row all-title-posts">Posts</span>
        </h1>

        <div className="all-portrait" aria-hidden="true">
          <Image
            className="all-portrait-image"
            src="/all-posts-hero.webp"
            alt=""
            fill
            sizes="(width <= 700px) 100vw, 55vw"
            preload
          />
          {slices.map((slice) => (
            <div
              className="all-portrait-slice"
              style={
                {
                  '--slice-top': `${slice.top}%`,
                  '--slice-bottom': `${100 - slice.top - slice.height}%`,
                  '--slice-shift': `${slice.shift}%`,
                } as CSSProperties
              }
              key={slice.top}
            >
              <Image
                className="all-portrait-image"
                src="/all-posts-hero.webp"
                alt=""
                fill
                sizes="55vw"
              />
            </div>
          ))}
        </div>

        <span className="all-block all-block-pink" aria-hidden="true" />
        <span className="all-block all-block-band" aria-hidden="true" />

        <a className="all-scroll" href="#archive-index">
          Scroll to view more
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v17M5 13l7 7 7-7" />
          </svg>
        </a>
      </section>

      <AllPostsIndex posts={indexPosts} />
    </main>
  );
}

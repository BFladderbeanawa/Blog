import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { RouteLink } from '@/components/site/Navigation';
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

  return (
    <main id="main-content" className="all-page" aria-labelledby="all-heading">
      <section className="all-hero">
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
              <Image className="all-portrait-image" src="/all-posts-hero.webp" alt="" fill sizes="55vw" />
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

      <section id="archive-index" className="all-index" aria-label="Posts">
        {posts.length === 0 ? (
          <p className="all-empty">Nothing published yet.</p>
        ) : (
          <ol className="all-list">
            {posts.map((post, index) => (
              <li className="all-row" key={post.slug}>
                <span className="all-row-number" aria-hidden="true">
                  {String(posts.length - index).padStart(2, '0')}
                </span>
                <time className="all-row-date" dateTime={post.pubDate}>
                  {dateFormatter.format(new Date(post.pubDate))}
                </time>
                <div className="all-row-body">
                  <h2 className="all-row-title">
                    <RouteLink className="all-row-link" href={`/posts/${post.slug}`}>
                      {post.title}
                    </RouteLink>
                  </h2>
                  <p className="all-row-description">{post.description}</p>
                </div>
                <svg className="all-row-arrow" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M4 24h40M28 8l16 16-16 16" />
                </svg>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

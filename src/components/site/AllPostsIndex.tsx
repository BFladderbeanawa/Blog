'use client';

import Image, { type StaticImageData } from 'next/image';
import { useState } from 'react';
import { DissolveNumber } from '@/components/site/DissolveNumber';
import { RouteLink } from '@/components/site/Navigation';

export type IndexPost = {
  slug: string;
  number: string;
  title: string;
  description: string;
  pubDate: string;
  date: string;
  tags: string[];
  cover?: StaticImageData | string;
};

const ALL = 'All';

// Second All Posts page: tag filter, Index lockup, numbered rows and a preview
// panel that follows the hovered or focused row. Rows keep their archive number
// when filtered, so a post is always "03" wherever it is listed.
export function AllPostsIndex({ posts }: { posts: IndexPost[] }) {
  const tags = [ALL, ...new Set(posts.flatMap((post) => post.tags))];
  const [tag, setTag] = useState(ALL);
  const visible = tag === ALL ? posts : posts.filter((post) => post.tags.includes(tag));
  const [hovered, setHovered] = useState<string>();
  const preview = visible.find((post) => post.slug === hovered) ?? visible[0];

  return (
    <section id="archive-index" className="all-index" aria-labelledby="index-heading" data-all-page>
      <span className="all-index-block all-index-blush" aria-hidden="true" />
      <span className="all-index-block all-index-band" aria-hidden="true" />

      <div className="all-tags">
        <h2 className="all-tags-title" id="tags-heading">
          Tags
        </h2>
        <ul className="all-tags-list" aria-labelledby="tags-heading">
          {tags.map((name) => (
            <li key={name}>
              <button
                type="button"
                className="all-tag"
                aria-pressed={tag === name}
                onClick={() => {
                  setTag(name);
                  setHovered(undefined);
                }}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <h2 id="index-heading" className="all-index-title">
        Index
      </h2>

      <div className="all-index-body">
        {visible.length === 0 ? (
          <p className="all-empty">Nothing published yet.</p>
        ) : (
          <ol className="all-list" aria-live="polite">
            {visible.map((post) => (
              <li
                className="all-row"
                key={post.slug}
                onPointerEnter={() => setHovered(post.slug)}
                onFocus={() => setHovered(post.slug)}
              >
                <span className="all-row-number" aria-hidden="true">
                  {post.number}
                </span>
                <div className="all-row-body">
                  <h3 className="all-row-title">
                    <RouteLink className="all-row-link" href={`/posts/${post.slug}`}>
                      {post.title}
                    </RouteLink>
                  </h3>
                  <p className="all-row-description">{post.description}</p>
                  <p className="all-row-meta">
                    <time dateTime={post.pubDate}>{post.date}</time>
                    {post.tags.length > 0 && (
                      <span className="all-row-tags">
                        <span className="sr-only">Tags: </span>
                        {post.tags.map((name) => (
                          <span className="all-row-tag" key={name}>
                            {name}
                          </span>
                        ))}
                      </span>
                    )}
                  </p>
                </div>
                <svg className="all-row-arrow" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M4 24h40M28 8l16 16-16 16" />
                </svg>
              </li>
            ))}
          </ol>
        )}

        <div className="all-preview" aria-hidden="true">
          {preview?.cover && (
            <Image
              key={preview.slug}
              className="all-preview-image"
              src={preview.cover}
              alt=""
              fill
              sizes="(width <= 1000px) 0px, 30vw"
            />
          )}
          {preview && <DissolveNumber className="all-preview-number" value={preview.number} />}
        </div>
      </div>
    </section>
  );
}

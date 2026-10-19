import type { Metadata } from 'next';
import Image from 'next/image';
import { ExploreLinks } from '@/components/site/ExploreLinks';
import { HomeDeck } from '@/components/site/HomeDeck';
import { PointillistLandscape } from '@/components/site/PointillistLandscape';
import { RouteLink } from '@/components/site/Navigation';
import { contactEmail, kaggleUrl, socials } from '@/data/site';
import { getPosts } from '@/lib/posts';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default async function Home() {
  const posts = await getPosts();
  const recentPosts = await Promise.all(
    posts.slice(0, 3).map(async (post) => ({
      ...post,
      // Each Markdown file selects its image at runtime; a static import cannot select it.
      cover: post.heroImage
        ? post.heroImage.startsWith('/')
          ? post.heroImage
          : (await import(`@/assets/${post.heroImage}`)).default
        : undefined,
    })),
  );
  return (
    <HomeDeck
      articleCount={recentPosts.length}
      labels={[
        'Opening',
        'Explore',
        ...recentPosts.map((post) => `Recent writing: ${post.title}`),
        'Elsewhere',
      ]}
    >
      <div className="scene-content opening">
        <div className="opening-composition">
          <h1 className="opening-handle">@BFladderbean</h1>
          <div className="opening-bio">
            <p>
              Studying <span className="highlight">Computer Science</span>
            </p>
            <p>
              I was an <span className="highlight">OIer</span>.
            </p>
            <p>
              I am (<span className="highlight">becoming</span>) a{' '}
              <span className="highlight">machine learning researcher</span>.
            </p>
            <p>
              I play <span className="highlight">Minecraft</span>/
              <span className="highlight">Celeste</span>/<span className="highlight">Arcaea</span>.
            </p>
            <p>
              I am a hobbyist of <span className="highlight">graΦc design</span>.
            </p>
          </div>
          <a className="scroll-cue" href="#scene-1" aria-label="Scroll to explore the site">
            <span>Scroll to explore</span>
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="m6 7 10 10L26 7M6 17l10 10 10-10" />
            </svg>
          </a>
        </div>
      </div>
      <div className="scene-content explore">
        <div className="explore-heading">
          <h2>
            Choose
            <br />a direction.
          </h2>
        </div>
        <ExploreLinks />
      </div>
      {recentPosts.map((post, index) => (
        <article className="scene-content writing" data-variant={index % 3} key={post.slug}>
          <div className="writing-composition">
            <div className="writing-id">
              <p>{index === 0 ? 'Latest work' : 'Recent writing'}</p>
            </div>
            <div className="writing-index">
              <strong>{String(index + 1).padStart(2, '0')}</strong>
              <span>/ {String(recentPosts.length).padStart(2, '0')}</span>
            </div>
            <RouteLink
              className="writing-slab"
              href={`/posts/${post.slug}`}
              aria-label={`Read ${post.title}`}
            >
              <h2 className="writing-title">{post.title}</h2>
              {/* Drawn by a CSS mask so it shares the title's sweep paint. */}
              <span className="writing-arrow" aria-hidden="true" />
            </RouteLink>
            <div className="writing-note">
              <p className="writing-lede">{post.description}</p>
            </div>
            <div className="writing-meta">
              <p>
                Published{' '}
                <time dateTime={post.pubDate}>
                  {new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    timeZone: 'UTC',
                  }).format(new Date(post.pubDate))}
                </time>
              </p>
              <RouteLink className="text-link" href="/all">
                All posts ({posts.length})
              </RouteLink>
            </div>
            <div className="writing-visual" aria-hidden="true">
              {post.cover ? (
                <Image src={post.cover} alt="" fill sizes="(max-width: 900px) 100vw, 58vw" />
              ) : null}
            </div>
            {/* The navigation's violet field settles into this cell, so only the
                first article carries it. */}
            {index === 0 ? <span className="writing-field" aria-hidden="true" /> : null}
            <RouteLink
              href={`/posts/${post.slug}`}
              className="writing-feature"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        </article>
      ))}
      <div className="scene-content closing">
        <PointillistLandscape />
        <h2>
          Keep
          <br />
          in touch.
        </h2>
        <div className="closing-bottom">
          <div className="closing-socials">
            {socials.map((link) => (
              <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.name}
                <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
            {kaggleUrl ? (
              <a href={kaggleUrl} target="_blank" rel="noopener noreferrer">
                Kaggle
                <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
            {contactEmail ? (
              <a href={`mailto:${contactEmail}`}>
                Email
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </div>
        </div>
        <small>BFladderbean © {new Date().getFullYear()}</small>
      </div>
    </HomeDeck>
  );
}

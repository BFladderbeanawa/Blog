import type { Metadata } from 'next';
import { HomeDeck } from '@/components/site/HomeDeck';
import { RouteLink } from '@/components/site/Navigation';
import { navigation, site, socials } from '@/data/site';
import { getPosts } from '@/lib/posts';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default async function Home() {
  const posts = await getPosts();
  return (
    <HomeDeck labels={['Opening', 'Explore', 'Recent writing', 'Elsewhere']}>
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
          <p>Make yourself at home.</p>
          <h2>
            Choose
            <br />a direction.
          </h2>
        </div>
        <nav className="explore-links" aria-label="Explore the archive">
          {navigation.map((link) => (
            <RouteLink href={link.href} key={link.href}>
              <span>{link.name}</span>
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M6 26 26 6M6 6h20v20" />
              </svg>
            </RouteLink>
          ))}
        </nav>
      </div>
      <div className="scene-content writing">
        <div className="writing-heading">
          <h2>
            Recent
            <br />
            writing<span aria-hidden="true">.</span>
          </h2>
          <RouteLink className="text-link" href="/all">
            All posts ({posts.length})
          </RouteLink>
        </div>
        <div className="home-posts">
          {posts.slice(0, 3).map((post) => (
            <RouteLink href={`/posts/${post.slug}`} className="home-post" key={post.slug}>
              <time dateTime={post.pubDate}>
                {new Intl.DateTimeFormat('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'UTC',
                }).format(new Date(post.pubDate))}
              </time>
              <h3 lang="zh-CN">{post.title}</h3>
              <p lang="zh-CN">{post.description}</p>
              <span className="post-open">
                Read essay <span aria-hidden="true">↗</span>
              </span>
            </RouteLink>
          ))}
        </div>
      </div>
      <div className="scene-content closing">
        <p>Beyond the page</p>
        <h2>
          Keep
          <br />
          in touch.
        </h2>
        <div className="closing-bottom">
          <p>
            {site.introduction}
            <br />
            <RouteLink href="/contact" className="text-link">
              Contact & social links
            </RouteLink>
          </p>
          <div className="closing-socials">
            {socials.map((link) => (
              <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.name}
                <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        </div>
        <small>BFladderbean © {new Date().getFullYear()}</small>
      </div>
    </HomeDeck>
  );
}

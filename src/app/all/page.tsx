import type { Metadata } from 'next';
import { RouteLink } from '@/components/site/Navigation';
import { getPosts } from '@/lib/posts';
import { pageEyebrow, pageIntro, pageShell, pageTitle } from '@/lib/ui';

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

export default async function AllPostsPage() {
  const posts = await getPosts();

  return (
    <main className={pageShell} id="main-content">
      <header className="page-heading mb-12">
        <p className={pageEyebrow}>The archive</p>
        <h1 className={pageTitle}>All Posts</h1>
        <p className={`${pageIntro} mt-8`}>
          Writing, development notes, and things I am learning. Articles stay in their original
          language.
        </p>
      </header>
      <ol className="post-list mt-16 flex list-none flex-col p-0">
        {posts.map((post) => (
          <li
            className="post-row grid grid-cols-[160px_1fr] gap-x-8 gap-y-4 border-t border-line py-8 max-md:grid-cols-[120px_1fr] max-xs:grid-cols-1 max-xs:gap-2"
            key={post.slug}
          >
            <time
              className="post-date pt-2 text-[13px] text-muted tabular-nums"
              dateTime={post.pubDate}
            >
              {dateFormatter.format(new Date(post.pubDate))}
            </time>
            <div>
              <h2 className="post-title font-scene text-[clamp(24px,3vw,42px)] leading-[1.4] tracking-[-0.035em]">
                <RouteLink className="hover:text-violet" href={`/posts/${post.slug}`}>
                  {post.title}
                </RouteLink>
              </h2>
              <p className="post-description mt-3 max-w-[48em] text-[15px] text-muted">
                {post.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}

import type { Metadata } from 'next';
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

export default async function AllPostsPage() {
  const posts = await getPosts();

  return (
    <main className="page-shell" id="main-content">
      <header className="page-heading">
        <p>The archive</p>
        <h1>All Posts</h1>
        <p className="page-intro">
          Writing, development notes, and things I am learning. Articles stay in their original
          language.
        </p>
      </header>
      <ol className="post-list">
        {posts.map((post) => (
          <li className="post-row" key={post.slug}>
            <time className="post-date" dateTime={post.pubDate}>
              {dateFormatter.format(new Date(post.pubDate))}
            </time>
            <div>
              <h2 className="post-title">
                <RouteLink href={`/posts/${post.slug}`}>{post.title}</RouteLink>
              </h2>
              <p className="post-description">{post.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}

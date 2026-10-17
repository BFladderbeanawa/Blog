import type { Metadata } from 'next';
import { RouteLink } from '@/components/site/Navigation';
import { friends } from '@/data/site';

export const metadata: Metadata = {
  title: 'Friend Links',
  description: 'Friends and their corners of the web.',
  alternates: { canonical: '/friends' },
};
export default function Friends() {
  return (
    <main id="main-content" className="page-shell friends-page">
      <div className="page-heading">
        <p>Friend Links</p>
        <h1>
          Other
          <br />
          corners.
        </h1>
      </div>
      {friends.length ? (
        <div className="entry-list">
          {friends.map((friend) => (
            <a href={friend.href} key={friend.href} target="_blank" rel="noopener noreferrer">
              <h2>{friend.name}</h2>
              <p>{friend.description}</p>
              <span className="sr-only">Opens in a new tab</span>
            </a>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <h2>No friend links published yet.</h2>
          <p>This space is reserved for real people and their websites.</p>
          <RouteLink className="text-link" href="/contact">
            Find my social profiles
          </RouteLink>
        </section>
      )}
    </main>
  );
}

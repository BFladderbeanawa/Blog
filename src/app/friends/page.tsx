import type { Metadata } from 'next';
import { RouteLink } from '@/components/site/Navigation';
import { friends } from '@/data/site';
import { pageEyebrow, pageShell, pageTitle, textLink } from '@/lib/ui';

export const metadata: Metadata = {
  title: 'Friend Links',
  description: 'Friends and their corners of the web.',
  alternates: { canonical: '/friends' },
};
export default function Friends() {
  return (
    <main id="main-content" className={pageShell}>
      <div className="page-heading mb-12">
        <p className={pageEyebrow}>Friend Links</p>
        <h1 className={pageTitle}>
          Other
          <br />
          corners.
        </h1>
      </div>
      {friends.length ? (
        <div className="entry-list">
          {friends.map((friend) => (
            <a
              className="block border-t border-line py-8 hover:[&_h2]:text-violet"
              href={friend.href}
              key={friend.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2 className="text-[28px]">{friend.name}</h2>
              <p className="mt-3 text-muted">{friend.description}</p>
              <span className="sr-only">Opens in a new tab</span>
            </a>
          ))}
        </div>
      ) : (
        <section className="empty-state my-[72px] mb-[100px] max-w-[680px] border-l-8 border-violet py-3 pl-8 max-xs:pl-6">
          <h2 className="mb-4 font-scene text-[26px] leading-[1.4]">
            No friend links published yet.
          </h2>
          <p className="mb-7 text-muted">
            This space is reserved for real people and their websites.
          </p>
          <RouteLink className={textLink} href="/contact">
            Find my social profiles
          </RouteLink>
        </section>
      )}
    </main>
  );
}

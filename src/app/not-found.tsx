import { RouteLink } from '@/components/site/Navigation';
import { pageEyebrow, pageIntro, pageShell, pageTitle, textLink } from '@/lib/ui';

export default function NotFound() {
  return (
    <main className={pageShell} id="main-content">
      <div className="page-heading mb-12">
        <p className={pageEyebrow}>404 / Not found</p>
        <h1 className={pageTitle}>
          Out of
          <br />
          the frame.
        </h1>
      </div>
      <p className={pageIntro}>There is no page at this address.</p>
      <div className="not-found-links mt-16 flex gap-8">
        <RouteLink className={textLink} href="/">
          Return home
        </RouteLink>
        <RouteLink className={textLink} href="/all">
          Browse all posts
        </RouteLink>
      </div>
    </main>
  );
}

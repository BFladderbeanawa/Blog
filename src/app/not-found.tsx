import { RouteLink } from '@/components/site/Navigation';

export default function NotFound() {
  return (
    <main id="main-content" className="page-shell not-found">
      <div className="page-heading">
        <p>404 / Not found</p>
        <h1>
          Out of
          <br />
          the frame.
        </h1>
      </div>
      <p className="page-intro">There is no page at this address.</p>
      <div className="not-found-links">
        <RouteLink className="text-link" href="/">
          Return home
        </RouteLink>
        <RouteLink className="text-link" href="/all">
          Browse all posts
        </RouteLink>
      </div>
    </main>
  );
}

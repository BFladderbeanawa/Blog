import type { Metadata } from 'next';
import { RouteLink } from '@/components/site/Navigation';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'About',
  description: site.introduction,
  alternates: { canonical: '/about' },
};
export default function About() {
  return (
    <main id="main-content" className="page-shell about-page">
      <div className="page-heading">
        <p>About</p>
        <h1>Hi, I am BF.</h1>
      </div>
      <p className="page-intro">{site.introduction}</p>
      <div className="about-sections">
        <section>
          <h2>What I make</h2>
          <p>{site.about}</p>
        </section>
        <section>
          <h2>What I notice</h2>
          <p>{site.interests}</p>
        </section>
        <section>
          <h2>Why I write</h2>
          <p>
            This archive collects notes about web development, mathematics, machine learning,
            philosophy, games, and anything else that asks for a place to land.
          </p>
        </section>
      </div>
      <RouteLink className="text-link" href="/all">
        Read the archive
      </RouteLink>
    </main>
  );
}

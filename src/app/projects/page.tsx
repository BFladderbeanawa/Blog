import type { Metadata } from 'next';
import { projects, socials } from '@/data/site';
import { pageEyebrow, pageShell, pageTitle, textLink } from '@/lib/ui';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected projects by BFladderbean.',
  alternates: { canonical: '/projects' },
};
export default function Projects() {
  return (
    <main id="main-content" className={pageShell}>
      <div className="page-heading mb-12">
        <p className={pageEyebrow}>Projects</p>
        <h1 className={pageTitle}>
          Things
          <br />I make.
        </h1>
      </div>
      {projects.length ? (
        <div className="entry-list">
          {projects.map((project) => (
            <a
              className="block border-t border-line py-8 hover:[&_h2]:text-violet"
              href={project.href}
              key={project.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h2 className="text-[28px]">{project.name}</h2>
              <p className="mt-3 text-muted">{project.description}</p>
              <span className="sr-only">Opens in a new tab</span>
            </a>
          ))}
        </div>
      ) : (
        <section className="empty-state my-[72px] mb-[100px] max-w-[680px] border-l-8 border-violet py-3 pl-8 max-xs:pl-6">
          <h2 className="mb-4 font-scene text-[26px] leading-[1.4]">
            No projects published here yet.
          </h2>
          <p className="mb-7 text-muted">
            For public code and repositories, visit my GitHub profile.
          </p>
          <a className={textLink} href={socials[0].href} target="_blank" rel="noopener noreferrer">
            Browse GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </section>
      )}
    </main>
  );
}

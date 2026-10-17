import type { Metadata } from 'next';
import { projects, socials } from '@/data/site';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected projects by BFladderbean.',
  alternates: { canonical: '/projects' },
};
export default function Projects() {
  return (
    <main id="main-content" className="page-shell projects-page">
      <div className="page-heading">
        <p>Projects</p>
        <h1>
          Things
          <br />I make.
        </h1>
      </div>
      {projects.length ? (
        <div className="entry-list">
          {projects.map((project) => (
            <a href={project.href} key={project.href} target="_blank" rel="noopener noreferrer">
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              <span className="sr-only">Opens in a new tab</span>
            </a>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <h2>No projects published here yet.</h2>
          <p>For public code and repositories, visit my GitHub profile.</p>
          <a className="text-link" href={socials[0].href} target="_blank" rel="noopener noreferrer">
            Browse GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </section>
      )}
    </main>
  );
}

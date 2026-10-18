import type { Metadata } from 'next';
import { contactEmail, kaggleUrl, socials } from '@/data/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Find BFladderbean on GitHub, Bilibili, and Kaggle, or get in touch by email.',
  alternates: { canonical: '/contact' },
};
export default function Contact() {
  return (
    <main id="main-content" className="page-shell contact-page">
      <div className="page-heading">
        <p>Contact</p>
        <h1>
          Find me
          <br />
          elsewhere.
        </h1>
      </div>
      <p className="page-intro">The places where I share code and spend time.</p>
      <div className="contact-links">
        {socials.map((link) => (
          <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer">
            <span>{link.name}</span>
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ))}
        {kaggleUrl ? (
          <a href={kaggleUrl} target="_blank" rel="noopener noreferrer">
            <span>Kaggle</span>
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <div className="unpublished">
            <span>Kaggle</span>
            <span>Account not published</span>
          </div>
        )}
        {contactEmail ? (
          <a href={`mailto:${contactEmail}`}>
            <span>Email</span>
            <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <div className="unpublished">
            <span>Email</span>
            <span>No public email address</span>
          </div>
        )}
      </div>
    </main>
  );
}

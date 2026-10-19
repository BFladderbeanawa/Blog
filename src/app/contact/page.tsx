import type { Metadata } from 'next';
import { contactEmail, kaggleUrl, socials } from '@/data/site';
import { pageEyebrow, pageIntro, pageShell, pageTitle } from '@/lib/ui';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Find BFladderbean on GitHub, Bilibili, and Kaggle, or get in touch by email.',
  alternates: { canonical: '/contact' },
};
export default function Contact() {
  return (
    <main id="main-content" className={pageShell}>
      <div className="page-heading mb-12">
        <p className={pageEyebrow}>Contact</p>
        <h1 className={pageTitle}>
          Find me
          <br />
          elsewhere.
        </h1>
      </div>
      <p className={`${pageIntro} mb-16`}>The places where I share code and spend time.</p>
      <div className="contact-links ml-auto max-w-[900px]">
        {socials.map((link) => (
          <a
            className="flex items-center justify-between gap-8 border-t border-line py-6 font-scene text-[clamp(32px,4vw,56px)] font-bold hover:text-violet"
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{link.name}</span>
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ))}
        {kaggleUrl ? (
          <a
            className="flex items-center justify-between gap-8 border-t border-line py-6 font-scene text-[clamp(32px,4vw,56px)] font-bold hover:text-violet"
            href={kaggleUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Kaggle</span>
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <div className="flex items-center justify-between gap-8 border-t border-line py-6 text-sm text-muted max-xs:items-baseline max-xs:gap-4 [&>span:first-child]:text-[22px] [&>span:first-child]:text-ink max-xs:[&>span:last-child]:text-right">
            <span>Kaggle</span>
            <span>Account not published</span>
          </div>
        )}
        {contactEmail ? (
          <a
            className="flex items-center justify-between gap-8 border-t border-line py-6 font-scene text-[clamp(32px,4vw,56px)] font-bold hover:text-violet"
            href={`mailto:${contactEmail}`}
          >
            <span>Email</span>
            <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <div className="flex items-center justify-between gap-8 border-t border-line py-6 text-sm text-muted max-xs:items-baseline max-xs:gap-4 [&>span:first-child]:text-[22px] [&>span:first-child]:text-ink max-xs:[&>span:last-child]:text-right">
            <span>Email</span>
            <span>No public email address</span>
          </div>
        )}
      </div>
    </main>
  );
}

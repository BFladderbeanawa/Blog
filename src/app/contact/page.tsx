import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { contactEmail, kaggleUrl, socials } from '@/data/site';
import { AnatomyStudy } from './AnatomyStudy';
import { CompassRoutes } from './CompassRoutes';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Find BFladderbean on GitHub, Bilibili, and Kaggle, or get in touch by email.',
  alternates: { canonical: '/contact' },
};

// Echo depth from the central heading; depth sets only color, never size.
const echoDepths = [4, 3, 2, 1];
// Links share the Contact row grid: left rows sit above the low left arm, right rows below the high right arm.
const routeSlots = [
  { side: 'left', row: -1 },
  { side: 'left', row: 0 },
  { side: 'right', row: 0 },
  { side: 'right', row: 1 },
] as const;

export default function Contact() {
  const routes = [
    ...socials.map((link) => ({ name: link.name, href: link.href, external: true, note: null })),
    {
      name: 'Kaggle',
      href: kaggleUrl,
      external: true,
      note: kaggleUrl ? null : 'Account not published',
    },
    {
      name: 'Email',
      href: contactEmail ? `mailto:${contactEmail}` : null,
      external: false,
      note: contactEmail ? null : 'No public email address',
    },
  ];

  return (
    <main id="main-content" className="contact-stage" aria-labelledby="contact-heading">
      <div className="contact-canvas">
        <div className="contact-field" aria-hidden="true" />
        <div className="contact-type-stack">
          {echoDepths.map((depth) => (
            <span
              className="contact-echo"
              data-depth={depth}
              style={{ '--from': depth } as CSSProperties}
              key={`above-${depth}`}
              aria-hidden="true"
            >
              Contact
            </span>
          ))}
          <h1 id="contact-heading">Contact</h1>
          {echoDepths.toReversed().map((depth) => (
            <span
              className="contact-echo"
              data-depth={depth}
              style={{ '--from': -depth } as CSSProperties}
              key={`below-${depth}`}
              aria-hidden="true"
            >
              Contact
            </span>
          ))}
        </div>
        {/* One cutout, two clipped layers so each arm can enter on its own path. */}
        {(['left', 'right'] as const).map((hand) => (
          <Image
            className="contact-hands"
            data-hand={hand}
            src="/contact-hands-navy-cutout.webp"
            alt=""
            fill
            sizes="100vw"
            preload
            key={hand}
          />
        ))}
        <AnatomyStudy />
      </div>

      <CompassRoutes>
        {routes.map((route, index) => (
          <li
            className="contact-route"
            data-side={routeSlots[index].side}
            style={{ '--row': routeSlots[index].row } as CSSProperties}
            key={route.name}
          >
            {route.href ? (
              <a
                className="contact-link"
                href={route.href}
                {...(route.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {route.name}
                {route.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
              </a>
            ) : (
              <span className="contact-link contact-link-unavailable">
                {route.name}
                <span className="contact-link-note">{route.note}</span>
              </span>
            )}
          </li>
        ))}
      </CompassRoutes>
    </main>
  );
}

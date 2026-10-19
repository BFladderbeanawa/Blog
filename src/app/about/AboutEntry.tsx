'use client';

import { useEffect } from 'react';
import { afterRouteCurtain } from '@/components/site/Navigation';

// Only the opening part of the thread is on screen at entry. Drawing the whole
// normalized path on one eased curve would finish that visible span in ~100ms,
// so the draw targets the on-screen span and runs it at a readable pace.
const DRAW_DURATION = 1600;
const DRAW_EASING = 'cubic-bezier(0.45, 0, 0.25, 1)';
const DRAW_SAMPLES = 240;
const REVEAL_STAGGER = 90;
const MAX_REVEAL_DELAY = 360;

/** Fraction of the path, from its start, drawn before it first leaves the viewport. */
function visibleFraction(path: SVGPathElement) {
  const matrix = path.getScreenCTM();
  if (!matrix) return 1;
  const length = path.getTotalLength();
  for (let i = 1; i <= DRAW_SAMPLES; i++) {
    const point = path.getPointAtLength((length * i) / DRAW_SAMPLES).matrixTransform(matrix);
    if (point.y > window.innerHeight) return i / DRAW_SAMPLES;
  }
  return 1;
}

export function AboutEntry() {
  useEffect(() => {
    const root = document.documentElement;
    const mode = root.dataset.aboutEntry;
    if (mode !== 'drawing' && mode !== 'reveal') return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce), (forced-colors: active)',
    ).matches;
    if (reduceMotion) {
      root.removeAttribute('data-about-entry');
      return;
    }

    const page = document.querySelector<HTMLElement>('[data-about-page]');
    if (!page) return;

    const thread = page.querySelector<SVGPathElement>('[data-about-thread]');
    const groups = Array.from(page.querySelectorAll<HTMLElement>('[data-about-reveal]'));
    let observer: IntersectionObserver | null = null;
    let draw: Animation | null = null;
    let revealing = false;

    const observe = () => {
      observer = new IntersectionObserver(
        (entries) => {
          const entering = entries
            .filter((entry) => entry.isIntersecting || entry.boundingClientRect.bottom < 0)
            .map((entry) => entry.target as HTMLElement)
            .filter((element) => !element.hasAttribute('data-revealed'))
            .sort((a, b) =>
              a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
            );

          entering.forEach((element, index) => {
            element.style.setProperty(
              '--about-reveal-delay',
              `${Math.min(index * REVEAL_STAGGER, MAX_REVEAL_DELAY)}ms`,
            );
            element.setAttribute('data-revealed', '');
            observer?.unobserve(element);
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
      );

      groups.forEach((element) => observer?.observe(element));
    };

    const revealText = () => {
      if (revealing) return;
      revealing = true;
      root.dataset.aboutEntry = 'reveal';
      observe();
    };

    if (mode === 'reveal') {
      observe();
    } else if (!thread) {
      revealText();
    } else {
      // Offset 1 → (1 - visible): the tip travels from the start of the line to
      // the viewport edge. Revealing text switches CSS to offset 0, which fills
      // in the off-screen remainder where no one can see it jump. Arriving
      // under the home page's roll, the draw starts once the page is uncovered.
      const cancelWait = afterRouteCurtain(() => {
        draw = thread.animate(
          [{ strokeDashoffset: 1 }, { strokeDashoffset: 1 - visibleFraction(thread) }],
          { duration: DRAW_DURATION, easing: DRAW_EASING, fill: 'forwards' },
        );
        draw.finished.then(
          () => {
            revealText();
            draw?.cancel();
          },
          () => {},
        );
      });

      return () => {
        cancelWait();
        draw?.cancel();
        observer?.disconnect();
      };
    }

    return () => observer?.disconnect();
  }, []);

  return null;
}

'use client';

import { useEffect } from 'react';
import { afterRouteCurtain } from '@/components/site/Navigation';

// Only the opening part of the thread is on screen at entry; how much of it
// depends on the viewport height. The draw covers that on-screen span in the
// same time on every screen. Dash offset advances in SVG units, which the
// unevenly stretched SVG (preserveAspectRatio="none") maps to uneven screen
// distances, so the keyframes are spaced by on-screen arc length instead: the
// pen eases in, then holds one speed until it leaves the viewport. Any
// deceleration would park the tip on the edge; acceleration reads as a lurch.
const DRAW_DURATION = 1400;
// Share of the draw spent accelerating; the rest runs at constant speed.
const DRAW_EASE_IN = 0.3;
const DRAW_KEYFRAMES = 48;
// Run the tip a little past the bottom edge so it clears the viewport mid-stroke.
const DRAW_OVERSHOOT = 0.06;
const DRAW_SAMPLES = 360;
const REVEAL_STAGGER = 90;
const MAX_REVEAL_DELAY = 360;

/** Share of the distance covered at time `t` (0–1): ease-in, then constant speed. */
function penProgress(t: number) {
  const speed = 1 / (1 - DRAW_EASE_IN / 2);
  return t < DRAW_EASE_IN ? (speed * t * t) / (2 * DRAW_EASE_IN) : speed * (t - DRAW_EASE_IN / 2);
}

/**
 * Dash-offset keyframes that draw the path from its start to just below the
 * viewport, spaced so the tip moves at an even on-screen speed.
 */
function drawKeyframes(path: SVGPathElement): Keyframe[] {
  const matrix = path.getScreenCTM();
  if (!matrix) return [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];
  const length = path.getTotalLength();
  const edge = window.innerHeight * (1 + DRAW_OVERSHOOT);
  // Cumulative on-screen distance at each sampled path fraction.
  const fractions = [0];
  const distances = [0];
  let previous = path.getPointAtLength(0).matrixTransform(matrix);
  for (let i = 1; i <= DRAW_SAMPLES; i++) {
    const point = path.getPointAtLength((length * i) / DRAW_SAMPLES).matrixTransform(matrix);
    fractions.push(i / DRAW_SAMPLES);
    distances.push(distances[i - 1] + Math.hypot(point.x - previous.x, point.y - previous.y));
    previous = point;
    if (point.y > edge) break;
  }

  const total = distances[distances.length - 1];
  const keyframes: Keyframe[] = [];
  let segment = 1;
  for (let k = 0; k <= DRAW_KEYFRAMES; k++) {
    const t = k / DRAW_KEYFRAMES;
    const target = total * penProgress(t);
    while (segment < distances.length - 1 && distances[segment] < target) segment++;
    const from = distances[segment - 1];
    const span = distances[segment] - from;
    const local = span > 0 ? Math.min(1, Math.max(0, (target - from) / span)) : 1;
    const fraction = fractions[segment - 1] + (fractions[segment] - fractions[segment - 1]) * local;
    keyframes.push({ offset: t, strokeDashoffset: 1 - fraction });
  }
  return keyframes;
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
      // Offset 1 → (1 - drawn fraction): the tip travels from the start of the
      // line to just past the viewport edge. Revealing text switches CSS to
      // offset 0, which fills in the off-screen remainder where no one can see
      // it jump. Arriving under the home page's roll, the draw starts once the
      // page is uncovered, so the span is measured against the settled layout.
      const cancelWait = afterRouteCurtain(() => {
        draw = thread.animate(drawKeyframes(thread), {
          duration: DRAW_DURATION,
          easing: 'linear',
          fill: 'forwards',
        });
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

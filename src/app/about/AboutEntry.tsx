'use client';

import { useEffect } from 'react';
import { afterRouteTransition } from '@/components/site/Navigation';

// Map normalized progress to on-screen arc length so the draw's easing stays
// consistent across viewport sizes and the SVG's uneven scaling.
const DRAW_DURATION = 850;
const DRAW_KEYFRAMES = 48;
// Run the tip a little past the bottom edge so it clears the viewport mid-stroke.
const DRAW_OVERSHOOT = 0.06;
const DRAW_SAMPLES = 360;
const REVEAL_STAGGER = 90;
const MAX_REVEAL_DELAY = 360;

/**
 * Dash-offset keyframes that draw the path from its start to just below the
 * viewport, spaced by on-screen arc length; animation timing owns the easing.
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
    const target = total * t;
    while (segment < distances.length - 1 && distances[segment] < target) segment++;
    const from = distances[segment - 1];
    const span = distances[segment] - from;
    const local = span > 0 ? Math.min(1, Math.max(0, (target - from) / span)) : 1;
    const fraction = fractions[segment - 1] + (fractions[segment] - fractions[segment - 1]) * local;
    keyframes.push({ offset: t, strokeDashoffset: 1 - fraction });
  }
  return keyframes;
}

/** Natural cubic interpolation minimizes bending across the whole thread. */
function interpolateThread(points: readonly (readonly [number, number])[]) {
  const count = points.length;
  const spans = points
    .slice(1)
    .map((point, i) => Math.hypot(point[0] - points[i][0], point[1] - points[i][1]));
  const diagonal = new Float64Array(count);
  const curvatureX = new Float64Array(count);
  const curvatureY = new Float64Array(count);

  // Solve the shared tridiagonal system for both coordinate second derivatives.
  // Natural endpoints have zero curvature; each internal join shares position,
  // tangent and curvature, rather than blending independently bent segments.
  for (let i = 1; i < count - 1; i++) {
    const left = spans[i - 1];
    const right = spans[i];
    const factor = i === 1 ? 0 : left / diagonal[i - 1];
    diagonal[i] = 2 * (left + right) - factor * left;
    curvatureX[i] =
      6 * ((points[i + 1][0] - points[i][0]) / right - (points[i][0] - points[i - 1][0]) / left) -
      factor * curvatureX[i - 1];
    curvatureY[i] =
      6 * ((points[i + 1][1] - points[i][1]) / right - (points[i][1] - points[i - 1][1]) / left) -
      factor * curvatureY[i - 1];
  }
  for (let i = count - 2; i > 0; i--) {
    curvatureX[i] = (curvatureX[i] - spans[i] * curvatureX[i + 1]) / diagonal[i];
    curvatureY[i] = (curvatureY[i] - spans[i] * curvatureY[i + 1]) / diagonal[i];
  }

  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < count - 1; i++) {
    const span = spans[i];
    const samples = Math.max(2, Math.ceil(span / 3));
    for (let sample = 1; sample <= samples; sample++) {
      const b = sample / samples;
      const a = 1 - b;
      const left = ((a * a * a - a) * span * span) / 6;
      const right = ((b * b * b - b) * span * span) / 6;
      const x =
        a * points[i][0] + b * points[i + 1][0] + left * curvatureX[i] + right * curvatureX[i + 1];
      const y =
        a * points[i][1] + b * points[i + 1][1] + left * curvatureY[i] + right * curvatureY[i + 1];
      d += ` L ${x.toFixed(3)} ${y.toFixed(3)}`;
    }
  }
  return d;
}

export function AboutEntry() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>('[data-about-page]');
    const thread = page?.querySelector<SVGPathElement>('[data-about-thread]');
    const svg = thread?.ownerSVGElement;
    if (!page || !thread || !svg) return;

    // Anchor the continuous thread to the actual layout, not a stretched page
    // illustration. Fonts, window changes and the disclosure all change its turns.
    const layoutThread = () => {
      const origin = svg.getBoundingClientRect();
      const bounds = (selector: string) => {
        const element = page.querySelector(selector)!;
        const box = element.getBoundingClientRect();
        return {
          x: box.left - origin.left,
          y: box.top - origin.top,
          right: box.right - origin.left,
          bottom: box.bottom - origin.top,
        };
      };
      const heading = bounds('.researchHeading');
      const equation = bounds('.equationNote');
      const body = bounds('.researchBody');
      const play = bounds('.playHeading');
      const design = bounds('.designFragment');
      const games = bounds('.gamesFragment');
      const router = bounds('.routerFragment');
      const minecraft = bounds('.minecraftFragment');
      const chat = bounds('.chatFragment');
      const blog = bounds('.blogFragment');
      const goodbye = bounds('.goodbye');
      const width = origin.width;
      // A tilted, open ellipse gives the return one sustained outward turn.
      // Equal angular anchors avoid the flat spots of individually placed bends.
      const loopScale = Math.min(1, (width - games.x - 24) / 390);
      const loop: [number, number][] = [];
      for (let i = 0; i <= 12; i++) {
        const angle = 2.65 - (4.9 * i) / 12;
        const along = 260 * Math.cos(angle) * loopScale;
        const across = 100 * Math.sin(angle) * loopScale;
        loop.push([
          games.x + 170 + along * 0.55 + across * 0.835,
          games.y + 230 - along * 0.835 + across * 0.55,
        ]);
      }
      svg.setAttribute('viewBox', `0 0 ${width} ${origin.height}`);
      thread.setAttribute(
        'd',
        interpolateThread([
          [30, 350],
          [width * 0.4, 100],
          [width * 0.82, 230],
          [width * 0.85, heading.y - 320],
          [width * 0.68, heading.y - 150],
          [width * 0.32, heading.y - 60],
          [heading.x - 70, heading.y + 150],
          [heading.x + 20, equation.bottom + 70],
          [body.x + 100, body.y - 80],
          [body.right + 90, body.y + 10],
          [body.right + 70, body.bottom + 40],
          [play.x + 180, play.y - 70],
          [play.x - 35, play.bottom + 30],
          [design.x + 40, design.bottom + 60],
          ...loop,
          [(router.right + minecraft.x) / 2, Math.max(router.bottom, minecraft.bottom) + 32],
          [chat.x - 80, chat.bottom - 60],
          [blog.x - 40, blog.y - 20],
          [goodbye.x + 30, goodbye.y - 20],
          [goodbye.x + 90, goodbye.y + 190],
          [width * 0.55, origin.height + 120],
        ]),
      );
    };

    layoutThread();
    const observer = new ResizeObserver(layoutThread);
    observer.observe(page);
    return () => observer.disconnect();
  }, []);

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
      // Draw the thread while the copy appears, after the route snapshot clears.
      // The animation holds the on-screen dash offset; CSS fills the off-screen
      // remainder when it finishes.
      const cancelWait = afterRouteTransition(() => {
        draw = thread.animate(drawKeyframes(thread), {
          duration: DRAW_DURATION,
          easing: 'ease-in-out',
          fill: 'forwards',
        });
        revealText();
        draw.finished.then(
          () => {
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

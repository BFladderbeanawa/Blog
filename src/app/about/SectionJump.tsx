'use client';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';

// Matches --ease in globals.css. A cubic-bezier evaluator lets the scroll
// follow the site curve rather than the browser's fixed smooth-scroll timing.
const ease = cubicBezier(0.22, 1, 0.36, 1);

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  return (x: number) => {
    let t = x;
    for (let i = 0; i < 4; i += 1) {
      const delta = ((ax * t + bx) * t + cx) * t - x;
      if (Math.abs(delta) < 1e-4) return ((ay * t + by) * t + cy) * t;
      const slope = (3 * ax * t + 2 * bx) * t + cx;
      if (Math.abs(slope) < 1e-6) break;
      t -= delta / slope;
    }

    let low = 0;
    let high = 1;
    t = x;
    for (let i = 0; i < 12; i += 1) {
      const value = ((ax * t + bx) * t + cx) * t;
      if (Math.abs(value - x) < 1e-4) break;
      if (value < x) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return ((ay * t + by) * t + cy) * t;
  };
}

const SCROLLING_KEYS: Record<string, true> = {
  ArrowDown: true,
  ArrowUp: true,
  PageDown: true,
  PageUp: true,
  Home: true,
  End: true,
  ' ': true,
};

// A same-page anchor does nothing once the URL already carries that hash,
// which strands the reader at the top after they scroll back. Scroll the
// target explicitly and keep the hash and browser history in sync.
export function SectionJump({
  sectionId,
  className,
  children,
}: {
  sectionId: string;
  className?: string;
  children: ReactNode;
}) {
  const frame = useRef<number | null>(null);

  // Reader input wins over the handoff, so a wheel, touch or scroll key
  // stops the tween instead of fighting it.
  useEffect(() => {
    const stop = () => {
      if (frame.current === null) return;
      window.cancelAnimationFrame(frame.current);
      frame.current = null;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (SCROLLING_KEYS[event.key]) stop();
    };

    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      stop();
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function jumpTo(target: HTMLElement) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
      return;
    }

    if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    frame.current = null;

    const start = window.scrollY;
    const scrollPadding =
      Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const scrollMargin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const destination = Math.min(
      maximum,
      Math.max(0, target.getBoundingClientRect().top + start - scrollPadding - scrollMargin),
    );
    const distance = destination - start;
    if (Math.abs(distance) < 2) return;

    // Long jumps get a little more time; short ones stay snappy.
    const duration = Math.min(950, Math.max(420, Math.abs(distance) * 0.42));
    const begun = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - begun) / duration);
      if (progress === 1) {
        window.scrollTo(0, destination);
        frame.current = null;
        return;
      }
      window.scrollTo(0, start + distance * ease(progress));
      frame.current = window.requestAnimationFrame(step);
    };

    frame.current = window.requestAnimationFrame(step);
  }

  return (
    <Link
      href={`#${sectionId}`}
      className={className}
      onNavigate={(event) => {
        const target = document.getElementById(sectionId);
        if (!target) return;
        event.preventDefault();
        const hash = `#${sectionId}`;
        if (window.location.hash !== hash) window.history.pushState(null, '', hash);
        jumpTo(target);
      }}
    >
      {children}
    </Link>
  );
}

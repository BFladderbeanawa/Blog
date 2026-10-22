'use client';

// Detented-wheel detection adapted from Arcadi4/blog.
// Copyright (c) 2026 4rcadia; MIT notice in THIRD_PARTY_NOTICES.md.
// The document's mandatory scroll snap owns the pages; this turns one discrete
// wheel notch into one page turn, which native snapping would undo, and turns
// from the hero to the index once the hero's entry has played.
import { useEffect } from 'react';

// The hero is a showpiece; the index is what visitors came for. After the hero's
// entry finishes, hold it briefly and turn to the index on its own.
const HERO_HOLD_MS = 0;

export function AllPostsPager() {
  useEffect(() => {
    const pages = Array.from(document.querySelectorAll<HTMLElement>('[data-all-page]'));
    if (pages.length < 2) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    // The first page starts above the header, at the document top.
    const stops = () =>
      pages.map((page, index) =>
        index === 0 ? 0 : page.getBoundingClientRect().top + window.scrollY,
      );
    const current = () =>
      Math.max(
        0,
        stops().findLastIndex((top) => top <= window.scrollY + 1),
      );
    let target = current();
    const wheel = (event: WheelEvent) => {
      const detent = Math.abs((event as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY ?? 0);
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      // Trackpad gestures stay native; an in-flight turn is retargeted from where it is.
      if (event.deltaMode === WheelEvent.DOM_DELTA_PIXEL && (detent < 120 || detent % 120 !== 0))
        return;
      const tops = stops();
      const index = current();
      const end = tops[index + 1] ?? document.documentElement.scrollHeight;
      // A page taller than the viewport scrolls natively inside itself.
      if (end - tops[index] > window.innerHeight + 2) return;
      event.preventDefault();
      target = Math.max(0, Math.min(tops.length - 1, target + Math.sign(event.deltaY)));
      window.scrollTo({ top: tops[target], behavior: reduced.matches ? 'instant' : 'smooth' });
    };
    const settled = () => {
      target = current();
    };
    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('scrollend', settled);

    // Only a fresh arrival at the top advances: a deep link, restored history
    // position or any input before the turn leaves the visitor where they are.
    const intents = ['wheel', 'keydown', 'pointerdown', 'touchstart'] as const;
    let advancePending = !location.hash && window.scrollY === 0;
    let holdTimer: number | undefined;
    const cancelAdvance = () => {
      advancePending = false;
      window.clearTimeout(holdTimer);
    };
    const advance = () => {
      if (!advancePending || window.scrollY !== 0) return;
      advancePending = false;
      target = 1;
      window.scrollTo({ top: stops()[1], behavior: reduced.matches ? 'instant' : 'smooth' });
    };
    if (advancePending) {
      for (const type of intents) window.addEventListener(type, cancelAdvance, { passive: true });
      if (reduced.matches) {
        advance();
      } else {
        Promise.allSettled(pages[0].getAnimations({ subtree: true }).map((a) => a.finished)).then(
          () => {
            if (advancePending) holdTimer = window.setTimeout(advance, HERO_HOLD_MS);
          },
        );
      }
    }

    return () => {
      cancelAdvance();
      for (const type of intents) window.removeEventListener(type, cancelAdvance);
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('scrollend', settled);
    };
  }, []);

  return null;
}

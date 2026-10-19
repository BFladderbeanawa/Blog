'use client';

import { useEffect, type RefObject } from 'react';

/** The stretched article link receives input; the decorative image never captures it. */
export function useWritingCover(sequenceRef: RefObject<HTMLElement | null>, active: number) {
  useEffect(() => {
    const article = sequenceRef.current?.querySelector<HTMLElement>(
      '[data-state="active"] .writing',
    );
    const visual = article?.querySelector<HTMLElement>('.writing-visual:has(img)');
    if (!article || !visual) return;
    const enabled = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)',
    );
    let x = 0;
    let y = 0;
    let frame = 0;
    const clear = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      visual.removeAttribute('data-cover-hover');
      visual.style.removeProperty('--cover-x');
      visual.style.removeProperty('--cover-y');
    };
    const paint = () => {
      frame = 0;
      const bounds = visual.getBoundingClientRect();
      if (
        !enabled.matches ||
        x < bounds.left ||
        x > bounds.right ||
        y < bounds.top ||
        y > bounds.bottom ||
        !bounds.width ||
        !bounds.height
      ) {
        clear();
        return;
      }
      visual.style.setProperty('--cover-x', String(((x - bounds.left) / bounds.width - 0.5) * 2));
      visual.style.setProperty('--cover-y', String(((y - bounds.top) / bounds.height - 0.5) * 2));
      visual.setAttribute('data-cover-hover', '');
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !enabled.matches) return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    article.addEventListener('pointermove', move, { passive: true });
    article.addEventListener('pointerleave', clear);
    article.addEventListener('pointercancel', clear);
    window.addEventListener('blur', clear);
    window.addEventListener('resize', clear);
    window.addEventListener('scroll', clear, { capture: true, passive: true });
    enabled.addEventListener('change', clear);
    return () => {
      clear();
      article.removeEventListener('pointermove', move);
      article.removeEventListener('pointerleave', clear);
      article.removeEventListener('pointercancel', clear);
      window.removeEventListener('blur', clear);
      window.removeEventListener('resize', clear);
      window.removeEventListener('scroll', clear, { capture: true });
      enabled.removeEventListener('change', clear);
    };
  }, [sequenceRef, active]);
}

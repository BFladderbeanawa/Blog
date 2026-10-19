'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function ClosingSocials({ children }: { children: ReactNode }) {
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = list.current;
    if (!node) return;
    const enabled = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)',
    );
    let row: HTMLAnchorElement | null = null;
    let x = 0;
    let y = 0;
    let frame = 0;

    const clear = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      row?.style.removeProperty('--social-x');
      row?.style.removeProperty('--social-y');
      row?.removeAttribute('data-parallax');
      row = null;
    };
    const paint = () => {
      frame = 0;
      if (!row) return;
      // Measure the fixed hit area, never the translated label or arrow.
      const bounds = row.getBoundingClientRect();
      if (
        !enabled.matches ||
        !bounds.width ||
        !bounds.height ||
        x < bounds.left ||
        x > bounds.right ||
        y < bounds.top ||
        y > bounds.bottom
      ) {
        clear();
        return;
      }
      row.style.setProperty('--social-x', String(((x - bounds.left) / bounds.width - 0.5) * 2));
      row.style.setProperty('--social-y', String(((y - bounds.top) / bounds.height - 0.5) * 2));
      row.setAttribute('data-parallax', '');
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !enabled.matches) return;
      const next = event.target instanceof Element ? event.target.closest('a') : null;
      if (next !== row) {
        clear();
        row = next;
      }
      if (!row) return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };

    node.addEventListener('pointermove', move, { passive: true });
    node.addEventListener('pointerleave', clear);
    node.addEventListener('pointercancel', clear);
    window.addEventListener('blur', clear);
    window.addEventListener('resize', clear);
    window.addEventListener('scroll', clear, { capture: true, passive: true });
    enabled.addEventListener('change', clear);
    return () => {
      clear();
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', clear);
      node.removeEventListener('pointercancel', clear);
      window.removeEventListener('blur', clear);
      window.removeEventListener('resize', clear);
      window.removeEventListener('scroll', clear, { capture: true });
      enabled.removeEventListener('change', clear);
    };
  }, []);

  return (
    <div className="closing-socials flex flex-col justify-end" ref={list}>
      {children}
    </div>
  );
}

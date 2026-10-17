'use client';

// Adapted from Arcadi4/blog CustomCursor.tsx; see THIRD_PARTY_NOTICES.md.
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const interactiveSelector = 'a, button, summary, [role="button"], input, select, textarea, label';

export function CustomCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  const refreshCursor = useRef<(() => void) | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    const node = cursor.current;
    if (!node) return;
    const fine = window.matchMedia('(pointer: fine) and (hover: hover)');
    const forced = window.matchMedia('(forced-colors: active)');
    let x = 0;
    let y = 0;
    let hasPosition = false;
    let inside = false;
    const hide = () => {
      document.documentElement.classList.remove('cursor-ready');
      node.dataset.visible = 'false';
      node.dataset.pressed = 'false';
      node.dataset.interactive = 'false';
      node.dataset.text = 'false';
    };
    const refresh = () => {
      if (
        !hasPosition ||
        !inside ||
        !document.hasFocus() ||
        document.visibilityState === 'hidden' ||
        !fine.matches ||
        forced.matches ||
        x < 0 ||
        y < 0 ||
        x >= window.innerWidth ||
        y >= window.innerHeight
      ) {
        hide();
        return;
      }
      const target = document.elementFromPoint(x, y);
      if (!target) {
        hide();
        return;
      }
      node.dataset.interactive = String(Boolean(target?.closest(interactiveSelector)));
      node.dataset.text = String(Boolean(target?.closest('.prose, input, textarea')));
      node.dataset.visible = 'true';
      document.documentElement.classList.add('cursor-ready');
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !fine.matches || forced.matches) {
        hasPosition = false;
        inside = false;
        hide();
        return;
      }
      x = event.clientX;
      y = event.clientY;
      hasPosition = true;
      inside = true;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      refresh();
    };
    const leave = () => {
      inside = false;
      hide();
    };
    const press = (event: PointerEvent) => {
      move(event);
      if (event.button === 0 && node.dataset.visible === 'true') {
        node.dataset.pressed = 'true';
      }
    };
    const release = () => {
      node.dataset.pressed = 'false';
    };
    refreshCursor.current = () => {
      release();
      refresh();
    };
    const root = document.documentElement;
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', move, { passive: true });
    root.addEventListener('pointerenter', move, { passive: true });
    root.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', leave);
    window.addEventListener('blur', hide);
    window.addEventListener('focus', refresh);
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('scroll', refresh, { passive: true, capture: true });
    window.addEventListener('resize', refresh);
    fine.addEventListener('change', refresh);
    forced.addEventListener('change', refresh);
    return () => {
      hide();
      refreshCursor.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', move);
      root.removeEventListener('pointerenter', move);
      root.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', leave);
      window.removeEventListener('blur', hide);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('pageshow', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('scroll', refresh, true);
      window.removeEventListener('resize', refresh);
      fine.removeEventListener('change', refresh);
      forced.removeEventListener('change', refresh);
    };
  }, []);
  useEffect(() => {
    // The persistent layout keeps this cursor mounted when the hovered page is replaced.
    refreshCursor.current?.();
    const frame = window.requestAnimationFrame(() => refreshCursor.current?.());
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
  return (
    <div ref={cursor} className="custom-cursor" aria-hidden="true">
      <span />
    </div>
  );
}

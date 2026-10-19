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
    let dragTarget: Element | null = null;
    const hide = () => {
      document.documentElement.classList.remove('cursor-ready');
      node.dataset.visible = 'false';
      node.dataset.pressed = 'false';
      node.dataset.interactive = 'false';
      node.dataset.text = 'false';
      node.dataset.draggable = 'false';
      node.dataset.dragging = 'false';
      dragTarget = null;
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
      node.dataset.draggable = String(
        Boolean(dragTarget || target.closest('[data-cursor="drag"]')),
      );
      node.dataset.dragging = String(Boolean(dragTarget));
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
        dragTarget = (event.target as Element | null)?.closest('[data-cursor="drag"]') ?? null;
        node.dataset.pressed = 'true';
        refresh();
      }
    };
    const release = () => {
      dragTarget = null;
      node.dataset.pressed = 'false';
      refresh();
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
    <div
      ref={cursor}
      className="custom-cursor group pointer-events-none fixed top-0 left-0 z-[10000] -mt-[22px] -ml-[22px] h-11 w-11 text-white opacity-0 mix-blend-difference data-[visible=true]:opacity-100 forced-colors:hidden"
      aria-hidden="true"
    >
      <span className="absolute top-[11px] left-[11px] h-[22px] w-[22px] rotate-45 scale-[0.55] border-2 border-current bg-current transition-[transform,background-color,border-radius] duration-[180ms] ease-smooth group-data-[interactive=true]:rotate-0 group-data-[interactive=true]:scale-[1.4] group-data-[interactive=true]:rounded-full group-data-[interactive=true]:bg-transparent [[data-text='true']:not([data-interactive='true'])_&]:rotate-0 [[data-text='true']:not([data-interactive='true'])_&]:scale-x-[0.12] [[data-text='true']:not([data-interactive='true'])_&]:scale-y-[1.1] [[data-text='true']:not([data-interactive='true'])_&]:rounded-none [[data-pressed='true']_&]:rotate-0 [[data-pressed='true']_&]:scale-x-[0.45] [[data-pressed='true']_&]:scale-y-[1.2] [[data-pressed='true']_&]:rounded-none [[data-pressed='true']_&]:duration-0 [[data-draggable='true']_&]:rotate-0 [[data-draggable='true']_&]:scale-80 [[data-draggable='true']_&]:rounded-full [[data-draggable='true']_&]:bg-current [[data-dragging='true']_&]:rotate-0 [[data-dragging='true']_&]:scale-70 [[data-dragging='true']_&]:rounded-full [[data-dragging='true']_&]:bg-current [[data-dragging='true']_&]:duration-0 [[data-draggable='true']_&]:before:absolute [[data-draggable='true']_&]:before:top-[-10px] [[data-draggable='true']_&]:before:left-[5px] [[data-draggable='true']_&]:before:h-2 [[data-draggable='true']_&]:before:w-2 [[data-draggable='true']_&]:before:rotate-45 [[data-draggable='true']_&]:before:border-t-2 [[data-draggable='true']_&]:before:border-l-2 [[data-draggable='true']_&]:before:border-current [[data-draggable='true']_&]:before:content-[''] [[data-draggable='true']_&]:after:absolute [[data-draggable='true']_&]:after:bottom-[-10px] [[data-draggable='true']_&]:after:left-[5px] [[data-draggable='true']_&]:after:h-2 [[data-draggable='true']_&]:after:w-2 [[data-draggable='true']_&]:after:rotate-[225deg] [[data-draggable='true']_&]:after:border-t-2 [[data-draggable='true']_&]:after:border-l-2 [[data-draggable='true']_&]:after:border-current [[data-draggable='true']_&]:after:content-[''] motion-reduce:transition-none" />
    </div>
  );
}

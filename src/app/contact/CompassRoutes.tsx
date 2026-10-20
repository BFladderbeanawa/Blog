'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// Turns the construction circle so its top pole (the needle) points at the
// hovered or focused contact link, then eases it back when nothing is engaged.
export function CompassRoutes({ children }: { children: ReactNode }) {
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const node = list.current;
    const stage = node?.closest<HTMLElement>('.contact-stage');
    const circle = stage?.querySelector<SVGCircleElement>('.contact-construction circle');
    if (!node || !stage || !circle) return;
    let hovered: HTMLAnchorElement | null = null;
    let focused: HTMLAnchorElement | null = null;
    // Unbounded so each move takes the shortest path from the current angle.
    let turn = 0;

    const update = () => {
      const target = hovered ?? focused;
      if (!target) {
        // Rest at the nearest full turn so release never unwinds a loop.
        turn = Math.round(turn / 360) * 360;
        stage.style.setProperty('--compass-turn', `${turn}deg`);
        stage.removeAttribute('data-compass');
        return;
      }
      // A circle's bounding box keeps its centre under rotation and scaling.
      const c = circle.getBoundingClientRect();
      const l = target.getBoundingClientRect();
      const dx = l.left + l.width / 2 - (c.left + c.width / 2);
      const dy = l.top + l.height / 2 - (c.top + c.height / 2);
      // Bearing clockwise from 12 o'clock, where the needle rests.
      const bearing = (Math.atan2(dx, -dy) * 180) / Math.PI;
      turn += ((((bearing - turn) % 360) + 540) % 360) - 180;
      stage.style.setProperty('--compass-turn', `${turn}deg`);
      stage.setAttribute('data-compass', '');
    };
    const linkOf = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLAnchorElement>('a.contact-link') : null;
    const over = (event: PointerEvent) => {
      const next = linkOf(event.target);
      if (!next || next === hovered) return;
      hovered = next;
      update();
    };
    const out = (event: PointerEvent) => {
      if (!hovered || hovered.contains(event.relatedTarget as Node | null)) return;
      hovered = null;
      update();
    };
    const focusIn = (event: FocusEvent) => {
      focused = linkOf(event.target);
      update();
    };
    const focusOut = (event: FocusEvent) => {
      if (focused?.contains(event.relatedTarget as Node | null)) return;
      focused = null;
      update();
    };
    const reset = () => {
      hovered = null;
      focused = null;
      update();
    };

    node.addEventListener('pointerover', over);
    node.addEventListener('pointerout', out);
    node.addEventListener('focusin', focusIn);
    node.addEventListener('focusout', focusOut);
    window.addEventListener('blur', reset);
    window.addEventListener('resize', update);
    return () => {
      node.removeEventListener('pointerover', over);
      node.removeEventListener('pointerout', out);
      node.removeEventListener('focusin', focusIn);
      node.removeEventListener('focusout', focusOut);
      window.removeEventListener('blur', reset);
      window.removeEventListener('resize', update);
      stage.style.removeProperty('--compass-turn');
      stage.removeAttribute('data-compass');
    };
  }, []);

  return (
    <ul className="contact-routes" aria-label="Find me elsewhere" ref={list}>
      {children}
    </ul>
  );
}

'use client';

// Per-glyph pointer dispersion adapted from Arcadi4/blog's proximity shadow
// links (src/components/proximity/ProximityShadowText.tsx); see
// THIRD_PARTY_NOTICES.md.
import { useEffect, useRef } from 'react';
import { RouteLink } from '@/components/site/Navigation';
import { navigation } from '@/data/site';

// Elliptical falloff keeps the split local to the pointer, not the whole row.
const reachX = 180;
const reachY = 72;

export function ExploreLinks() {
  const list = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = list.current;
    if (!node) return;
    const enabled = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)',
    );
    const labels = Array.from(node.querySelectorAll<HTMLElement>('.explore-label')).map(
      (label) => ({
        label,
        glyphs: Array.from(label.querySelectorAll<HTMLElement>('.dispersion-glyph')).map(
          (glyph) => ({ glyph, x: '0px', y: '0px', nextX: '0px', nextY: '0px' }),
        ),
      }),
    );
    let pointerX = 0;
    let pointerY = 0;
    let inside = false;
    let frame = 0;

    const paint = () => {
      frame = 0;
      // Read stable layout positions before writing styles. The readable glyph
      // never moves, so its own split cannot feed back into the next measurement.
      for (const { label, glyphs } of labels) {
        const bounds = label.getBoundingClientRect();
        for (const item of glyphs) {
          const dx = pointerX - (bounds.left + item.glyph.offsetLeft + item.glyph.offsetWidth / 2);
          const dy = pointerY - (bounds.top + item.glyph.offsetTop + item.glyph.offsetHeight / 2);
          const near =
            inside && enabled.matches ? Math.max(0, 1 - Math.hypot(dx / reachX, dy / reachY)) : 0;
          const strength = near * near;
          item.nextX = `${(strength * Math.tanh(dx / 24) * 5).toFixed(2)}px`;
          item.nextY = `${(strength * Math.tanh(dy / 16) * 2.5).toFixed(2)}px`;
        }
      }
      for (const { glyphs } of labels) {
        for (const item of glyphs) {
          if (item.x !== item.nextX) {
            item.glyph.style.setProperty('--split-x', item.nextX);
            item.x = item.nextX;
          }
          if (item.y !== item.nextY) {
            item.glyph.style.setProperty('--split-y', item.nextY);
            item.y = item.nextY;
          }
        }
      }
    };
    const schedule = () => {
      if (!frame && inside) frame = window.requestAnimationFrame(paint);
    };
    const clear = () => {
      inside = false;
      if (frame) window.cancelAnimationFrame(frame);
      paint();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !enabled.matches) return;
      inside = true;
      pointerX = event.clientX;
      pointerY = event.clientY;
      schedule();
    };
    const reposition = () => {
      if (!inside) return;
      const bounds = node.getBoundingClientRect();
      if (
        pointerX < bounds.left ||
        pointerX > bounds.right ||
        pointerY < bounds.top ||
        pointerY > bounds.bottom
      )
        clear();
      else schedule();
    };

    node.addEventListener('pointermove', move, { passive: true });
    node.addEventListener('pointerleave', clear);
    node.addEventListener('pointercancel', clear);
    window.addEventListener('scroll', reposition, { passive: true, capture: true });
    window.addEventListener('blur', clear);
    window.addEventListener('resize', reposition);
    enabled.addEventListener('change', clear);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', clear);
      node.removeEventListener('pointercancel', clear);
      window.removeEventListener('scroll', reposition, { capture: true });
      window.removeEventListener('blur', clear);
      window.removeEventListener('resize', reposition);
      enabled.removeEventListener('change', clear);
    };
  }, []);

  return (
    <nav className="explore-links" aria-label="Explore the archive" ref={list}>
      {navigation.map((link) => (
        <RouteLink href={link.href} key={link.href} aria-label={link.name}>
          <span className="explore-label" aria-hidden="true">
            {Array.from(link.name).map((character, index) => (
              <span className="dispersion-glyph" key={`${character}-${index}`}>
                {character}
              </span>
            ))}
          </span>
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path d="M6 26 26 6M6 6h20v20" />
          </svg>
        </RouteLink>
      ))}
    </nav>
  );
}

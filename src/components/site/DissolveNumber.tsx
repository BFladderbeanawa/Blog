'use client';

// Gooey text morph adapted from Arcadia's MorphingText
// (https://github.com/Arcadi4/blog, src/components/ui/morphing-text.tsx).
// Copyright (c) 2026 4rcadia. MIT License; see THIRD_PARTY_NOTICES.md.

import { useId, useLayoutEffect, useRef, useState } from 'react';

// Arcadia's scene index uses 0.45s for the same hand-off.
const MORPH_MS = 450;
const BLUR_FACTOR = 8;
const MAX_BLUR = 100;

// Each layer melts as its share falls: blur grows without bound near zero and
// opacity drops slower than linear, so the two glyphs overlap as soft blobs.
function setShare(element: HTMLSpanElement | null, fraction: number) {
  if (!element) return;
  const blur = fraction <= 0 ? MAX_BLUR : Math.min(BLUR_FACTOR / fraction - BLUR_FACTOR, MAX_BLUR);
  element.style.filter = `blur(${blur}px)`;
  element.style.opacity = String(fraction ** 0.4);
}

type Morph = { current: string; previous: string | null };

/** A number whose old value melts into the next one through a shared alpha threshold. */
export function DissolveNumber({ value, className }: { value: string; className?: string }) {
  const filterId = `morph-${useId().replace(/[^\w-]/g, '')}`;
  const [morph, setMorph] = useState<Morph>({ current: value, previous: null });
  const outgoing = useRef<HTMLSpanElement>(null);
  const incoming = useRef<HTMLSpanElement>(null);
  // Share of the incoming layer; 1 when settled.
  const fraction = useRef(1);

  useLayoutEffect(() => {
    if (value === morph.current) return;
    // Interrupted mid-morph: hand off from whichever glyph currently dominates.
    const dominant =
      morph.previous !== null && fraction.current < 0.5 ? morph.previous : morph.current;
    setMorph({ current: value, previous: dominant === value ? null : dominant });
  }, [value, morph]);

  useLayoutEffect(() => {
    if (morph.previous === null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)').matches) {
      fraction.current = 1;
      setMorph((active) => ({ ...active, previous: null }));
      return;
    }
    const start = performance.now();
    fraction.current = 0;
    setShare(incoming.current, 0);
    setShare(outgoing.current, 1);
    let frame = window.requestAnimationFrame(function step(now) {
      const share = Math.min(1, (now - start) / MORPH_MS);
      fraction.current = share;
      setShare(incoming.current, share);
      setShare(outgoing.current, 1 - share);
      if (share < 1) frame = window.requestAnimationFrame(step);
      else setMorph((active) => ({ ...active, previous: null }));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [morph]);

  const morphing = morph.previous !== null;
  return (
    <span className={className}>
      <svg className="absolute size-0" aria-hidden="true" focusable="false">
        <defs>
          {/* Hard alpha threshold: overlapping blurs fuse, then snap back to solid ink. */}
          <filter id={filterId} x="-100%" y="-100%" width="300%" height="300%">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
      <span
        className="grid justify-items-end"
        style={morphing ? { filter: `url(#${filterId}) blur(0.6px)` } : undefined}
      >
        {morphing && (
          <span ref={outgoing} className="[grid-area:1/1] will-change-[filter,opacity]">
            {morph.previous}
          </span>
        )}
        <span
          ref={incoming}
          // Settled: drop the per-frame styles so the glyph renders natively.
          key={morphing ? 'morphing' : 'settled'}
          className="[grid-area:1/1] will-change-[filter,opacity]"
        >
          {morph.current}
        </span>
      </span>
    </span>
  );
}

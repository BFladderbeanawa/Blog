'use client';

// Re-cuts the held writing field when the current article changes: every plate
// of the entering article starts on the rectangle the same plate occupies on
// screen, then scales and travels into its own cut (FLIP). The deck's scene
// state decides which article is current; this module only animates the change.
import { useLayoutEffect, useRef, type RefObject } from 'react';

// Every variant is cut into the same six plates, and a plate keeps its role and
// color across cuts, so plates pair by role.
const PLATES = [
  '.writing-id',
  '.writing-index',
  '.writing-slab',
  '.writing-note',
  '.writing-meta',
  '.writing-visual',
];
const PLATE_MS = 760;
const CONTENT_MS = 460;
const CONTENT_DELAY_MS = 380;
const CONTENT_STAGGER_MS = 40;
const FADE_MS = 220;

const owned = new WeakMap<HTMLElement, Animation[]>();

function stop(article: HTMLElement) {
  owned.get(article)?.forEach((animation) => animation.cancel());
  owned.delete(article);
}

/** True when CSS holds the writing articles on the canvas, so plates may be re-cut. */
export function writingHeld(sequence: Element) {
  return getComputedStyle(sequence).getPropertyValue('--writing-morph').trim() === 'on';
}

export function useWritingMorph(sequenceRef: RefObject<HTMLElement | null>, current: number) {
  const previous = useRef<{ current: number; enhanced: boolean } | null>(null);

  // Runs on every commit so the enhancement flag seen by the previous commit is
  // known: a reload that restores a later article is not a transition.
  useLayoutEffect(() => {
    const sequence = sequenceRef.current;
    if (!sequence) return;
    const enhanced = sequence.closest('[data-enhanced]') !== null;
    const before = previous.current;
    previous.current = { current, enhanced };
    if (!before || before.current === current) return;
    const articles = Array.from(sequence.querySelectorAll<HTMLElement>('.scene-content.writing'));
    if (!before.enhanced || !writingHeld(sequence)) {
      articles.forEach(stop);
      return;
    }
    const leaving = articles[before.current];
    const entering = articles[current];
    if (!leaving || !entering) return;

    // Reads before writes: the leaving plates where they are drawn now, an
    // interrupted morph included, then the entering plates at rest.
    const from = PLATES.map((selector) => leaving.querySelector(selector)?.getBoundingClientRect());
    owned.get(leaving)?.forEach((animation) => animation.pause());
    stop(entering);
    const targets = PLATES.map((selector) => entering.querySelector<HTMLElement>(selector));
    const to = targets.map((plate) => plate?.getBoundingClientRect());
    const tokens = getComputedStyle(sequence);
    const panel = tokens.getPropertyValue('--ease-panel').trim() || 'ease-in-out';
    const ease = tokens.getPropertyValue('--ease').trim() || 'ease-out';

    // The violet handoff field rests on the lead article's label plate and
    // travels with it, unless scene state is expanding it over the canvas.
    const field = entering.querySelector<HTMLElement>('.writing-field');
    const fieldRests = entering.closest('[data-state]')?.getAttribute('data-state') === 'active';
    const animations: Animation[] = [];
    targets.forEach((plate, index) => {
      const start = from[index];
      const end = to[index];
      if (!plate || !start || !end || !end.width || !end.height) return;
      const keyframes: Keyframe[] = [
        {
          transformOrigin: '0 0',
          transform: `translate(${start.left - end.left}px, ${start.top - end.top}px) scale(${start.width / end.width}, ${start.height / end.height})`,
        },
        { transformOrigin: '0 0', transform: 'none' },
      ];
      const timing: KeyframeAnimationOptions = { duration: PLATE_MS, easing: panel };
      animations.push(plate.animate(keyframes, timing));
      if (index === 0 && field && fieldRests) animations.push(field.animate(keyframes, timing));
      // A plate is flat color while it is stretched; its own content arrives
      // once the cut has nearly settled, so no type is drawn distorted.
      for (const child of Array.from(plate.children)) {
        animations.push(
          child.animate(
            child instanceof HTMLImageElement
              ? [{ opacity: 0 }, { opacity: 1 }]
              : [
                  { opacity: 0, transform: 'translateY(18px)' },
                  { opacity: 1, transform: 'none' },
                ],
            {
              duration: CONTENT_MS,
              delay: CONTENT_DELAY_MS + index * CONTENT_STAGGER_MS,
              easing: ease,
              fill: 'backwards',
            },
          ),
        );
      }
    });
    owned.set(entering, animations);

    // The leaving article stays frozen on top just long enough to dissolve its
    // content over the matching plates, which start on the same rectangles.
    const fade = leaving.animate(
      [
        { opacity: 1, zIndex: 4 },
        { opacity: 0, zIndex: 4 },
      ],
      { duration: FADE_MS, easing: 'linear' },
    );
    const held = [...(owned.get(leaving) ?? []), fade];
    owned.set(leaving, held);
    fade.onfinish = () => {
      if (owned.get(leaving) === held) stop(leaving);
    };
  });
}

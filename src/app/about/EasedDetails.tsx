'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

// Matches --ease in globals.css.
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const DURATION = 520;

// Native <details> toggles instantly. Keep its semantics and keyboard
// behavior, but drive the content height ourselves so the panel opens and
// closes on the same curve as the rest of the site.
export function EasedDetails({
  className,
  contentClassName,
  bodyClassName,
  summary,
  children,
}: {
  className?: string;
  contentClassName?: string;
  bodyClassName?: string;
  summary: ReactNode;
  children: ReactNode;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const expandedRef = useRef(false);
  const [open, setOpen] = useState(false);

  useEffect(() => () => animationRef.current?.cancel(), []);

  function toggle() {
    const details = detailsRef.current;
    const content = contentRef.current;
    if (!details || !content) return;

    const next = !expandedRef.current;
    expandedRef.current = next;
    // Closed details still report their content layout, so only trust the
    // measured height when the panel is already open (including a tween
    // that is still running).
    const visibleHeight = details.open ? content.getBoundingClientRect().height : 0;
    animationRef.current?.cancel();
    animationRef.current = null;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      details.open = next;
      content.style.height = next ? 'auto' : '0px';
      setOpen(next);
      return;
    }

    if (next) {
      if (!details.open) {
        details.open = true;
        content.style.height = '0px';
      }
      setOpen(true);

      const target = content.scrollHeight;
      const animation = content.animate(
        [{ height: `${visibleHeight}px` }, { height: `${target}px` }],
        { duration: DURATION, easing: EASE, fill: 'forwards' },
      );
      animationRef.current = animation;
      animation.onfinish = () => {
        content.style.height = 'auto';
        animation.cancel();
        animationRef.current = null;
      };
      return;
    }

    const animation = content.animate([{ height: `${visibleHeight}px` }, { height: '0px' }], {
      duration: DURATION,
      easing: EASE,
      fill: 'forwards',
    });
    animationRef.current = animation;
    animation.onfinish = () => {
      details.open = false;
      content.style.height = '0px';
      setOpen(false);
      animation.cancel();
      animationRef.current = null;
    };
  }

  return (
    <details ref={detailsRef} open={open} className={className}>
      <summary
        onClick={(event) => {
          event.preventDefault();
          toggle();
        }}
      >
        {summary}
      </summary>
      <div ref={contentRef} className={contentClassName}>
        <div className={bodyClassName}>{children}</div>
      </div>
    </details>
  );
}

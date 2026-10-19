'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
import type { PostHeading } from '@/lib/posts';

const STEP_ANGLE = 11;
const STEP_RADIUS = 210;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function TableOfContents({ headings }: { headings: PostHeading[] }) {
  const [position, setPosition] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const positionRef = useRef(0);
  const drumRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef(0);
  const dragRef = useRef<{
    pointerId: number;
    startY: number;
    startPosition: number;
    index: number;
    moved: boolean;
    target: HTMLElement;
  } | null>(null);
  const suppressClickUntil = useRef(0);

  // Article scroll drives a continuous position, so the drum turns between
  // headings instead of snapping from row to row.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!headings.length) return;
      if (dragRef.current?.moved) return;

      const marker = window.scrollY + Math.min(window.innerHeight * 0.15, 110);
      const tops = headings.map((heading) => {
        const element = document.getElementById(heading.id);
        return element ? element.getBoundingClientRect().top + window.scrollY : Infinity;
      });

      let next = 0;
      while (next + 1 < tops.length && tops[next + 1] <= marker) next += 1;
      if (next + 1 < tops.length) {
        const span = tops[next + 1] - tops[next];
        if (span > 0) next += clamp((marker - tops[next]) / span, 0, 1);
      }

      next = Math.round(next * 100) / 100;
      setActiveIndex(clamp(Math.floor(next), 0, headings.length - 1));
      if (next !== positionRef.current) {
        positionRef.current = next;
        setPosition(next);
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [headings]);

  const jumpTo = useCallback(
    (index: number) => {
      const heading = headings[clamp(index, 0, headings.length - 1)];
      if (!heading) return;
      const target = document.getElementById(heading.id);
      if (!target) return;

      const hash = `#${heading.id}`;
      if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
      target.scrollIntoView({
        block: 'start',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    },
    [headings],
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      const current = Math.round(positionRef.current);
      const next = clamp(current + direction, 0, headings.length - 1);
      positionRef.current = next;
      setPosition(next);
    },
    [headings.length],
  );

  useEffect(() => {
    const drum = drumRef.current;
    if (!drum) return;

    const onWheel = (event: WheelEvent) => {
      if (prefersReducedMotion()) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      wheelRef.current += event.deltaY;
      const threshold = event.deltaMode === 1 ? 3 : 42;
      if (Math.abs(wheelRef.current) < threshold) return;
      const direction = wheelRef.current > 0 ? 1 : -1;
      wheelRef.current = 0;
      step(direction);
    };

    drum.addEventListener('wheel', onWheel, { passive: false });
    return () => drum.removeEventListener('wheel', onWheel);
  }, [step]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const distance = drag.startY - event.clientY;
      if (!drag.moved && Math.abs(distance) < 4) return;
      if (!drag.moved) {
        drag.moved = true;
        drag.target.setPointerCapture(event.pointerId);
        drag.target.dataset.dragging = 'true';
        setDragging(true);
      }
      event.preventDefault();
      const next = clamp(drag.startPosition + distance / 34, 0, headings.length - 1);
      positionRef.current = next;
      setPosition(next);
      drag.index = Math.round(next);
    };

    const stop = () => {
      const drag = dragRef.current;
      if (!drag) return;
      dragRef.current = null;
      drag.target.dataset.dragging = 'false';
      if (drag.target.hasPointerCapture(drag.pointerId)) {
        drag.target.releasePointerCapture(drag.pointerId);
      }
      if (drag.moved) {
        suppressClickUntil.current = Date.now() + 250;
        positionRef.current = drag.index;
        setPosition(drag.index);
      }
      setDragging(false);
    };

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    window.addEventListener('blur', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      window.removeEventListener('blur', stop);
      stop();
    };
  }, [headings.length]);

  useEffect(() => {
    const restore = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) {
        window.scrollTo({ top: 0 });
        return;
      }
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    };

    window.addEventListener('popstate', restore);
    // A hard load can settle at the top before the anchor is laid out, so
    // apply the requested heading once more after hydration.
    const initial = window.location.hash ? window.setTimeout(restore, 0) : undefined;
    return () => {
      if (initial !== undefined) window.clearTimeout(initial);
      window.removeEventListener('popstate', restore);
    };
  }, []);

  // In the reduced-motion fallback the drum is a normal scrolling list, so
  // keep the current section visible there without touching the page scroll.
  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const drum = drumRef.current;
    const id = headings[activeIndex]?.id;
    if (!drum || !id) return;
    const link = drum.querySelector<HTMLElement>(`[data-heading-id="${CSS.escape(id)}"]`);
    if (!link) return;

    const drumBox = drum.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    if (linkBox.top < drumBox.top) {
      drum.scrollTop += linkBox.top - drumBox.top - 8;
    } else if (linkBox.bottom > drumBox.bottom) {
      drum.scrollTop += linkBox.bottom - drumBox.bottom + 8;
    }
  }, [activeIndex, headings]);

  function handlePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startPosition: positionRef.current,
      index: Math.round(positionRef.current),
      moved: false,
      target: event.currentTarget,
    };
  }

  function handleClick(event: ReactMouseEvent<HTMLAnchorElement>, index: number) {
    if (Date.now() < suppressClickUntil.current) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    jumpTo(index);
  }

  return (
    <nav
      className="post-toc"
      aria-label="Contents"
      data-cursor="drag"
      data-dragging={dragging}
      onPointerDown={handlePointerDown}
      onDragStart={(event) => event.preventDefault()}
    >
      <p className="post-toc-label">Contents</p>
      <div
        className="post-toc-drum"
        ref={drumRef}
        style={
          {
            '--step-angle': `-${STEP_ANGLE}deg`,
            '--step-radius': `${STEP_RADIUS}px`,
          } as CSSProperties
        }
      >
        <ol className="post-toc-wheel">
          {headings.map((heading, index) => {
            const offset = index - position;
            const distance = Math.abs(offset);
            return (
              <li
                className="post-toc-item"
                data-level={heading.level}
                key={heading.id}
                style={
                  {
                    '--offset': offset,
                    opacity: Math.max(0.1, 1 - distance * 0.28),
                    pointerEvents: distance > 2.4 ? 'none' : undefined,
                    zIndex: Math.max(1, 30 - Math.round(distance * 5)),
                  } as CSSProperties
                }
              >
                <a
                  className="post-toc-link"
                  data-heading-id={heading.id}
                  href={`#${heading.id}`}
                  title={heading.text}
                  draggable={false}
                  aria-current={index === activeIndex ? 'location' : undefined}
                  onClick={(event) => handleClick(event, index)}
                >
                  <span className="post-toc-number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="post-toc-text">{heading.text}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

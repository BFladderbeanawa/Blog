'use client';

// Scene state/visibility and detented-wheel detection adapted from Arcadi4/blog.
// Copyright (c) 2026 4rcadia; MIT notice in THIRD_PARTY_NOTICES.md.
import { Children, useEffect, useRef, useState, type ReactNode } from 'react';

export function HomeDeck({ children, labels }: { children: ReactNode; labels: readonly string[] }) {
  const slides = Children.toArray(children);
  const deckRef = useRef<HTMLElement>(null);
  const targetRef = useRef(0);
  const [active, setActive] = useState(0);
  const selectRef = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const scenes = Array.from(deck.querySelectorAll<HTMLElement>('[data-home-scene]'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sceneTop = (index: number) => scenes[index].offsetTop;
    const storageKey = 'bf-home-scene';
    let scrollFrame = 0;
    const cancelScroll = () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
      deck.style.removeProperty('scroll-snap-type');
    };
    const select = (index: number) => {
      cancelScroll();
      targetRef.current = Math.max(0, Math.min(scenes.length - 1, index));
      const destination = sceneTop(targetRef.current);
      const start = deck.scrollTop;
      if (
        reduced.matches ||
        Math.max(start, destination) > sceneTop(1) + 1 ||
        !CSS.supports('animation-timeline: scroll()') ||
        window.matchMedia('(forced-colors: active)').matches
      ) {
        deck.scrollTo({ top: destination, behavior: reduced.matches ? 'instant' : 'smooth' });
        return;
      }
      if (start === destination) return;
      deck.style.scrollSnapType = 'none';
      const duration = 620 * Math.min(1, Math.abs(destination - start) / deck.clientHeight);
      const started = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - started) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        deck.scrollTo({ top: start + (destination - start) * eased, behavior: 'instant' });
        if (progress < 1) scrollFrame = window.requestAnimationFrame(animate);
        else cancelScroll();
      };
      scrollFrame = window.requestAnimationFrame(animate);
    };
    selectRef.current = select;
    let saved = 0;
    try {
      saved = Number(sessionStorage.getItem(storageKey) ?? 0);
    } catch {
      /* Storage is optional. */
    }
    const hashIndex = scenes.findIndex((scene) => `#${scene.id}` === window.location.hash);
    const restored =
      hashIndex >= 0
        ? hashIndex
        : Number.isInteger(saved)
          ? Math.min(Math.max(saved, 0), scenes.length - 1)
          : 0;
    deck.scrollTo({ top: sceneTop(restored), behavior: 'instant' });
    targetRef.current = restored;
    let visibleScene = restored;
    const visibility = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visibility.set(entry.target, entry.intersectionRatio);
        let index = 0;
        scenes.forEach((scene, candidate) => {
          if ((visibility.get(scene) ?? 0) > (visibility.get(scenes[index]) ?? 0))
            index = candidate;
        });
        visibleScene = index;
        setActive(index);
        try {
          sessionStorage.setItem(storageKey, String(index));
        } catch {
          /* Storage is optional. */
        }
      },
      { root: deck, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    scenes.forEach((scene) => observer.observe(scene));
    const wheel = (event: WheelEvent) => {
      const detent = Math.abs((event as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY ?? 0);
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      // Trackpad gestures stay native; discrete wheels retarget the current
      // scene movement without queuing another animation.
      if (event.deltaMode === WheelEvent.DOM_DELTA_PIXEL && (detent < 120 || detent % 120 !== 0)) {
        cancelScroll();
        return;
      }
      const visible = scenes.findIndex(
        (scene, index) => sceneTop(index) + scene.offsetHeight > deck.scrollTop + 1,
      );
      const scene = scenes[Math.max(visible, 0)];
      if (scene.offsetHeight > deck.clientHeight + 2) return;
      event.preventDefault();
      select(targetRef.current + Math.sign(event.deltaY));
    };
    const settled = () => {
      if (scrollFrame) return;
      const midpoint = deck.scrollTop + deck.clientHeight / 2;
      targetRef.current = Math.max(
        0,
        scenes.findIndex(
          (scene, index) =>
            sceneTop(index) <= midpoint && sceneTop(index) + scene.offsetHeight > midpoint,
        ),
      );
    };
    const keydown = (event: KeyboardEvent) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (event.target instanceof Element &&
          event.target.closest('a,button,input,textarea,select,[contenteditable]'))
      )
        return;
      const offsets: Record<string, number> = {
        ArrowDown: 1,
        PageDown: 1,
        ' ': event.shiftKey ? -1 : 1,
        ArrowUp: -1,
        PageUp: -1,
      };
      if (event.key === 'Home' || event.key === 'End' || event.key in offsets) {
        // At high zoom, preserve ordinary keyboard scrolling inside tall scenes.
        if (scenes[targetRef.current]?.offsetHeight > deck.clientHeight + 2) return;
        event.preventDefault();
        select(
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? scenes.length - 1
              : targetRef.current + offsets[event.key],
        );
      }
    };
    const fragment = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[href="#scene-1"]')
          : null;
      if (!link) return;
      event.preventDefault();
      window.history.pushState(null, '', link.hash);
      select(1);
    };
    let deckWidth = deck.clientWidth;
    let deckHeight = deck.clientHeight;
    const resize = new ResizeObserver(() => {
      if (deck.clientWidth === deckWidth && deck.clientHeight === deckHeight) return;
      if (!scrollFrame) targetRef.current = visibleScene;
      deckWidth = deck.clientWidth;
      deckHeight = deck.clientHeight;
      cancelScroll();
      deck.scrollTo({ top: sceneTop(targetRef.current), behavior: 'instant' });
    });
    resize.observe(deck);
    deck.addEventListener('wheel', wheel, { passive: false });
    deck.addEventListener('scrollend', settled);
    deck.addEventListener('click', fragment);
    deck.addEventListener('touchstart', cancelScroll, { passive: true });
    reduced.addEventListener('change', cancelScroll);
    window.addEventListener('keydown', keydown);
    deck.dataset.enhanced = 'true';
    return () => {
      cancelScroll();
      observer.disconnect();
      resize.disconnect();
      deck.removeEventListener('wheel', wheel);
      deck.removeEventListener('scrollend', settled);
      deck.removeEventListener('click', fragment);
      deck.removeEventListener('touchstart', cancelScroll);
      reduced.removeEventListener('change', cancelScroll);
      window.removeEventListener('keydown', keydown);
    };
  }, []);

  const scenes = slides.map((slide, index) => (
    <section
      id={`scene-${index}`}
      className={`home-scene scene-${index}`}
      key={labels[index]}
      data-home-scene
      data-scene-index={index}
      data-state={index === active ? 'active' : index < active ? 'past' : 'future'}
      aria-label={labels[index]}
    >
      {slide}
    </section>
  ));

  return (
    <main
      ref={deckRef}
      id="main-content"
      className="home-deck"
      data-active={active}
      aria-label="Homepage scenes"
      tabIndex={-1}
    >
      <div className="intro-sequence">
        <div className="intro-background" aria-hidden="true">
          <div className="opening-colorfield">
            <span className="opening-plane opening-plane-acid" />
            <span className="opening-plane opening-plane-violet" />
            <span className="opening-plane opening-plane-base" />
          </div>
        </div>
        {scenes.slice(0, 2)}
      </div>
      {scenes.slice(2)}
      <nav className="scene-picker" aria-label="Choose homepage scene">
        {labels.map((label, index) => (
          <button
            type="button"
            key={label}
            onClick={() => selectRef.current(index)}
            aria-current={index === active ? 'step' : undefined}
            aria-label={`${index + 1}: ${label}`}
          >
            <span className="scene-tick" />
            <span className="scene-picker-label">{label}</span>
          </button>
        ))}
      </nav>
      <p className="sr-only" aria-live="polite">
        {labels[active]}
      </p>
    </main>
  );
}

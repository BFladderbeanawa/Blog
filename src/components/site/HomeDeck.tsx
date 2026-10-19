'use client';

// Scene state/visibility and detented-wheel detection adapted from Arcadi4/blog.
// Copyright (c) 2026 4rcadia; MIT notice in THIRD_PARTY_NOTICES.md.
// Scene selection uses native smooth scrolling, and the intro choreography is
// driven by scene state in CSS rather than by scroll offset.
import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { useClosingCut, useWritingMorph, writingHeld } from './useWritingMorph';
import { useWritingCover } from './useWritingCover';

// The two intro scenes come first, then `articleCount` writing scenes.
const FIRST_ARTICLE = 2;

export function HomeDeck({
  children,
  labels,
  articleCount,
}: {
  children: ReactNode;
  labels: readonly string[];
  articleCount: number;
}) {
  const slides = Children.toArray(children);
  const deckRef = useRef<HTMLElement>(null);
  const targetRef = useRef(0);
  const [active, setActive] = useState(0);
  const sequenceRef = useRef<HTMLDivElement>(null);
  // The article the held writing field shows: the active one, or the nearest
  // one while the deck is outside the sequence, so entry and exit uncover it.
  const currentArticle = Math.min(Math.max(active - FIRST_ARTICLE, 0), articleCount - 1);
  useWritingMorph(sequenceRef, currentArticle);
  useClosingCut(sequenceRef);
  useWritingCover(sequenceRef, active);
  const selectRef = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const scenes = Array.from(deck.querySelectorAll<HTMLElement>('[data-home-scene]'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sceneTop = (index: number) => scenes[index].offsetTop;
    const storageKey = 'bf-home-scene';
    const select = (index: number) => {
      targetRef.current = Math.max(0, Math.min(scenes.length - 1, index));
      deck.scrollTo({
        top: sceneTop(targetRef.current),
        behavior: reduced.matches ? 'instant' : 'smooth',
      });
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
    // Publish the restored scene before the enhancement flag, so a reload never
    // renders the restored scene's content as an un-revealed future scene.
    setActive(restored);
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
      // Trackpad gestures stay native; a discrete wheel notch moves one scene,
      // and an in-flight scroll is retargeted by the browser from where it is.
      if (event.deltaMode === WheelEvent.DOM_DELTA_PIXEL && (detent < 120 || detent % 120 !== 0))
        return;
      const visible = scenes.findIndex(
        (scene, index) => sceneTop(index) + scene.offsetHeight > deck.scrollTop + 1,
      );
      const scene = scenes[Math.max(visible, 0)];
      if (scene.offsetHeight > deck.clientHeight + 2) return;
      event.preventDefault();
      select(targetRef.current + Math.sign(event.deltaY));
    };
    const settled = () => {
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
    // A held scene is already on the canvas, so focus would not scroll the deck
    // to it; tabbing into one selects that scene instead. Chrome's own focus
    // scroll lands after focusin and cancels a smooth scroll, and the held
    // sequence never draws the deck's travel anyway, so jump instantly and let
    // scene state carry the change.
    const focusin = (event: FocusEvent) => {
      const sequence = sequenceRef.current;
      if (!sequence || !(event.target instanceof Element) || !writingHeld(sequence)) return;
      const scene = event.target.closest<HTMLElement>('.writing-sequence > [data-home-scene]');
      const index = scene ? scenes.indexOf(scene) : -1;
      if (index < 0) return;
      targetRef.current = index;
      requestAnimationFrame(() => deck.scrollTo({ top: sceneTop(index), behavior: 'instant' }));
    };
    let deckWidth = deck.clientWidth;
    let deckHeight = deck.clientHeight;
    const resize = new ResizeObserver(() => {
      if (deck.clientWidth === deckWidth && deck.clientHeight === deckHeight) return;
      targetRef.current = visibleScene;
      deckWidth = deck.clientWidth;
      deckHeight = deck.clientHeight;
      deck.scrollTo({ top: sceneTop(targetRef.current), behavior: 'instant' });
    });
    resize.observe(deck);
    deck.addEventListener('wheel', wheel, { passive: false });
    deck.addEventListener('scrollend', settled);
    deck.addEventListener('click', fragment);
    deck.addEventListener('focusin', focusin);
    window.addEventListener('keydown', keydown);
    deck.dataset.enhanced = 'true';
    return () => {
      observer.disconnect();
      resize.disconnect();
      deck.removeEventListener('wheel', wheel);
      deck.removeEventListener('scrollend', settled);
      deck.removeEventListener('click', fragment);
      deck.removeEventListener('focusin', focusin);
      window.removeEventListener('keydown', keydown);
    };
  }, []);

  const scenes = slides.map((slide, index) => {
    const closing = index === slides.length - 1;
    const surface =
      index === 0
        ? 'bg-transparent text-ink'
        : index === 1
          ? 'bg-violet text-paper'
          : closing
            ? 'bg-ink text-acid'
            : 'bg-paper text-ink';
    return (
      <section
        id={`scene-${index}`}
        className={`home-scene scene-${index} relative min-h-svh snap-start snap-always overflow-clip ${surface}`}
        key={labels[index]}
        data-home-scene
        data-scene-index={index}
        data-state={index === active ? 'active' : index < active ? 'past' : 'future'}
        data-current={index - FIRST_ARTICLE === currentArticle ? '' : undefined}
        aria-label={labels[index]}
      >
        {slide}
      </section>
    );
  });

  return (
    <main
      ref={deckRef}
      id="main-content"
      className="home-deck relative isolate h-svh snap-y snap-mandatory scroll-smooth overflow-x-clip overflow-y-auto overscroll-y-contain bg-acid [scrollbar-width:none] [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto motion-reduce:snap-proximity"
      data-active={active}
      aria-label="Homepage scenes"
      tabIndex={-1}
    >
      <div className="intro-sequence relative bg-paper">
        <div
          className="intro-background pointer-events-none absolute top-0 h-svh w-full bg-paper"
          aria-hidden="true"
        >
          <div className="opening-colorfield pointer-events-none absolute inset-0">
            <span className="opening-plane opening-plane-acid absolute top-0 right-0 h-[calc(50%-40px)] w-[17vw] bg-acid max-xs:h-40 max-xs:w-[10vw]" />
            <span className="opening-plane opening-plane-violet absolute inset-0 z-[2] bg-violet [clip-path:inset(calc(50%-40px)_8%_calc(50%-56px)_83%)] max-xs:top-40 max-xs:right-auto max-xs:bottom-auto max-xs:left-0 max-xs:h-8 max-xs:w-[5vw] max-xs:[clip-path:none]" />
            <span className="opening-plane opening-plane-base absolute bottom-0 left-0 h-[clamp(32px,9svh,88px)] w-[24vw] bg-acid max-xs:h-6" />
          </div>
        </div>
        {scenes.slice(0, 2)}
      </div>
      {/* The closing scene is held with the articles, so its arrival is drawn by
          scene state rather than by the deck's travel. */}
      {articleCount > 0 ? (
        <div className="writing-sequence" ref={sequenceRef}>
          {scenes.slice(FIRST_ARTICLE)}
        </div>
      ) : (
        scenes.slice(FIRST_ARTICLE)
      )}
      <nav
        className="scene-picker fixed top-1/2 right-[22px] z-20 -translate-y-1/2 text-paper mix-blend-difference max-xs:right-2"
        aria-label="Choose homepage scene"
      >
        {labels.map((label, index) => (
          <button
            type="button"
            key={label}
            className="group relative flex h-10 w-10 items-center justify-end border-0 bg-transparent p-2"
            onClick={() => selectRef.current(index)}
            aria-current={index === active ? 'step' : undefined}
            aria-label={`${index + 1}: ${label}`}
          >
            <span className="scene-tick h-0.5 w-3 origin-right bg-current transition-transform duration-[180ms] ease-smooth group-aria-[current=step]:scale-x-200" />
            <span className="scene-picker-label absolute right-11 text-[11px] whitespace-nowrap opacity-0 transition-opacity duration-[140ms] group-hover:opacity-100 group-focus-visible:opacity-100 max-xs:hidden">
              {label}
            </span>
          </button>
        ))}
      </nav>
      <p className="sr-only" aria-live="polite">
        {labels[active]}
      </p>
    </main>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  type TransitionEvent,
} from 'react';

const NavigationContext = createContext<((href: string) => void) | null>(null);

type ArticleCurtain = {
  title: string;
  target: string;
  stage: 'enter' | 'cover' | 'leave';
  plateStyle: CSSProperties;
  titleStyle: CSSProperties;
};

// A writing scene's violet plate and its title, measured before the route
// changes so the overlay continues the exact rectangles the reader clicked.
// Every recent-writing scene uses the same handoff; the active scene is the
// one the held sequence currently draws.
function measureArticleCurtain(href: string): Omit<ArticleCurtain, 'stage'> | null {
  if (!href.startsWith('/posts/')) return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)').matches)
    return null;
  const feature = Array.from(document.querySelectorAll<HTMLAnchorElement>('.writing-feature')).find(
    (link) =>
      link.getAttribute('href') === href &&
      link.closest<HTMLElement>('[data-home-scene]')?.dataset.state === 'active',
  );
  const scene = feature?.closest<HTMLElement>('[data-home-scene]');
  if (!scene) return null;
  const sceneBox = scene.getBoundingClientRect();
  if (sceneBox.bottom <= 0 || sceneBox.top >= window.innerHeight) return null;
  const plate = scene.querySelector<HTMLElement>('.writing-slab');
  const title = scene.querySelector<HTMLElement>('.writing-title');
  if (!plate || !title) return null;
  const plateBox = plate.getBoundingClientRect();
  const titleBox = title.getBoundingClientRect();
  if (!plateBox.width || !plateBox.height || !titleBox.width) return null;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const font = window.getComputedStyle(title);
  return {
    title: title.textContent?.trim() ?? '',
    target: href,
    plateStyle: {
      left: `${plateBox.left}px`,
      top: `${plateBox.top}px`,
      width: `${plateBox.width}px`,
      height: `${plateBox.height}px`,
      '--curtain-scale-x': String(viewportWidth / plateBox.width),
      '--curtain-scale-y': String(viewportHeight / plateBox.height),
      '--curtain-shift-x': `${-plateBox.left}px`,
      '--curtain-shift-y': `${-plateBox.top}px`,
    } as CSSProperties,
    titleStyle: {
      left: `${titleBox.left}px`,
      top: `${titleBox.top}px`,
      width: `${titleBox.width}px`,
      fontFamily: font.fontFamily,
      fontSize: font.fontSize,
      fontWeight: font.fontWeight,
      fontStyle: font.fontStyle,
      lineHeight: font.lineHeight,
      letterSpacing: font.letterSpacing,
      '--title-shift-x': `${(viewportWidth - titleBox.width) / 2 - titleBox.left}px`,
      '--title-shift-y': `${(viewportHeight - titleBox.height) / 2 - titleBox.top}px`,
    } as CSSProperties,
  };
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pending = useRef<(() => void) | null>(null);
  const current = useRef<ViewTransition | null>(null);
  const [curtain, setCurtain] = useState<ArticleCurtain | null>(null);
  const arrived = useRef(false);
  const covered = useRef(false);
  const target = useRef<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    pending.current?.();
    pending.current = null;
  }, [pathname]);

  useEffect(
    () => () => {
      pending.current?.();
      current.current?.skipTransition();
    },
    [],
  );

  // The violet plate covers the viewport on the panel curve; the title travels
  // to the center in the same beat. Navigation does not start until the plate
  // has landed, so no edge of a still-expanding canvas ever reveals the
  // incoming article. The route then commits under the covered field.
  const finishCover = useCallback(() => {
    covered.current = true;
    if (!started.current && target.current) {
      started.current = true;
      router.push(target.current);
    }
    if (!arrived.current) return;
    setCurtain((active) => (active?.stage === 'cover' ? { ...active, stage: 'leave' } : active));
  }, [router]);

  useEffect(() => {
    if (!curtain || curtain.stage !== 'enter') return;
    let first = 0;
    let second = 0;
    first = window.requestAnimationFrame(() => {
      second = window.requestAnimationFrame(() =>
        setCurtain((active) =>
          active?.stage === 'enter' ? { ...active, stage: 'cover' } : active,
        ),
      );
    });
    return () => {
      window.cancelAnimationFrame(first);
      window.cancelAnimationFrame(second);
    };
  }, [curtain?.stage]);

  // transitionend is the normal clock; this timer keeps a missed event from
  // holding the reader on a covered canvas.
  useEffect(() => {
    if (curtain?.stage !== 'cover') return;
    const timer = window.setTimeout(finishCover, 700);
    return () => window.clearTimeout(timer);
  }, [curtain?.stage, finishCover]);

  // A failed, cancelled or superseded route must not strand the cover either.
  const active = curtain !== null;
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => {
      arrived.current = true;
      finishCover();
    }, 4000);
    return () => window.clearTimeout(timer);
  }, [active, finishCover]);

  // The exit waits for both the covered canvas and the committed article, so
  // a slow route never uncovers the old page and a quick one never clips the
  // expansion.
  useEffect(() => {
    if (!curtain || curtain.target !== pathname) return;
    arrived.current = true;
    if (!covered.current) return;
    setCurtain((active) => (active?.stage === 'cover' ? { ...active, stage: 'leave' } : active));
  }, [curtain, pathname]);

  useEffect(() => {
    if (curtain?.stage !== 'leave') return;
    const timer = window.setTimeout(() => setCurtain(null), 700);
    return () => window.clearTimeout(timer);
  }, [curtain?.stage]);

  function navigate(href: string) {
    pending.current?.();
    current.current?.skipTransition();
    const handoff = measureArticleCurtain(href);
    if (handoff) {
      arrived.current = false;
      covered.current = false;
      started.current = false;
      target.current = href;
      setCurtain({ ...handoff, stage: 'enter' });
      // Navigation starts when the cover lands. This handoff draws its own
      // layers; a root snapshot would double it.
      return;
    }
    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      router.push(href);
      return;
    }
    current.current = document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          // Navigation starts immediately. A failed/cancelled route must never hold a snapshot.
          const timeout = window.setTimeout(resolve, 1500);
          pending.current = () => {
            window.clearTimeout(timeout);
            resolve();
          };
          router.push(href);
        }),
    );
    void current.current.finished.catch(() => {});
  }

  const plateSettled = (event: TransitionEvent<HTMLSpanElement>) => {
    if (event.propertyName === 'transform') finishCover();
  };
  const curtainSettled = (event: TransitionEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget &&
      event.propertyName === 'transform' &&
      curtain?.stage === 'leave'
    )
      setCurtain(null);
  };

  return (
    <NavigationContext value={navigate}>
      {children}
      {curtain ? (
        <div
          className="article-curtain"
          data-stage={curtain.stage}
          onTransitionEnd={curtainSettled}
          aria-hidden="true"
        >
          <span
            className="article-curtain-plate"
            style={curtain.plateStyle}
            onTransitionEnd={plateSettled}
          />
          <span className="article-curtain-title" style={curtain.titleStyle}>
            {curtain.title}
          </span>
        </div>
      ) : null}
    </NavigationContext>
  );
}

export function RouteLink({ href, children, ...props }: ComponentProps<typeof Link>) {
  const navigate = useContext(NavigationContext);
  const pathname = usePathname();
  return (
    <Link
      href={href}
      {...props}
      onNavigate={(event) => {
        let prevented = false;
        props.onNavigate?.({
          preventDefault: () => {
            prevented = true;
            event.preventDefault();
          },
        });
        if (
          prevented ||
          !navigate ||
          typeof href !== 'string' ||
          !href.startsWith('/') ||
          href.includes('#') ||
          href === pathname
        )
          return;
        event.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </Link>
  );
}

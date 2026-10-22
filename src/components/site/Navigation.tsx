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

function isAboutRoute(href: string) {
  try {
    return new URL(href, window.location.href).pathname === '/about';
  } catch {
    return false;
  }
}

type CurtainStage = 'enter' | 'cover' | 'leave';

type ArticleCurtain = {
  title: string;
  target: string;
  plateStyle: CSSProperties;
  titleStyle: CSSProperties;
};

type Curtain = ArticleCurtain & { stage: CurtainStage };

const ROUTE_TRANSITION_FINISHED = 'route-transition-finished';

/** Starts a page's own entrance after the shared route snapshot is released. */
export function afterRouteTransition(start: () => void) {
  if (!document.documentElement.hasAttribute('data-route-transition')) {
    start();
    return () => {};
  }
  window.addEventListener(ROUTE_TRANSITION_FINISHED, start, { once: true });
  return () => window.removeEventListener(ROUTE_TRANSITION_FINISHED, start);
}

// A writing scene's violet plate and its title, measured before the route
// changes so the overlay continues the exact rectangles the reader clicked.
// Every recent-writing scene uses the same handoff; the active scene is the
// one the held sequence currently draws.
function measureArticleCurtain(href: string): ArticleCurtain | null {
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
  const [curtain, setCurtain] = useState<Curtain | null>(null);
  const arrived = useRef(false);
  const covered = useRef(false);
  const target = useRef<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    pending.current?.();
    pending.current = null;
    if (pathname !== '/about') document.documentElement.removeAttribute('data-about-entry');
  }, [pathname]);

  // History entries do not pass through RouteLink. Mark a return to About
  // before React renders it so its copy starts hidden rather than flashing.
  useEffect(() => {
    const beginAboutHistoryEntry = () => {
      if (window.location.pathname === '/about')
        document.documentElement.dataset.aboutEntry = 'drawing';
    };
    window.addEventListener('popstate', beginAboutHistoryEntry);
    return () => window.removeEventListener('popstate', beginAboutHistoryEntry);
  }, []);

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

  function beginCurtain(next: ArticleCurtain) {
    arrived.current = false;
    covered.current = false;
    started.current = false;
    target.current = next.target;
    // Navigation starts when the cover lands. The curtain draws its own
    // layers; a root snapshot would double it.
    setCurtain({ ...next, stage: 'enter' });
  }

  function navigate(href: string) {
    // A covering curtain owns the next route; a second request would strand it.
    if (curtain && curtain.stage !== 'leave') return;
    pending.current?.();
    current.current?.skipTransition();
    if (isAboutRoute(href) && window.location.pathname !== '/about')
      document.documentElement.dataset.aboutEntry = 'drawing';
    const handoff = measureArticleCurtain(href);
    if (handoff) {
      beginCurtain(handoff);
      return;
    }
    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)').matches
    ) {
      router.push(href);
      return;
    }
    // From the All Posts index an article arrives as the next page to the
    // right: both snapshots travel left together instead of the default wipe.
    document.documentElement.dataset.routeTransition =
      pathname === '/all' && href.startsWith('/posts/') ? 'push' : '';
    const transition = document.startViewTransition(
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
    current.current = transition;
    const finish = () => {
      if (current.current !== transition) return;
      current.current = null;
      document.documentElement.removeAttribute('data-route-transition');
      window.dispatchEvent(new Event(ROUTE_TRANSITION_FINISHED));
    };
    void transition.finished.then(finish, finish);
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
          className="article-curtain group pointer-events-auto fixed inset-0 z-[9000] translate-x-0 overflow-hidden transition-transform duration-[520ms] ease-[cubic-bezier(0.3,0.7,0.2,1)] will-change-[transform,filter] data-[stage=leave]:-translate-x-full data-[stage=leave]:animate-[article-curtain-whoosh_520ms_linear_both]"
          data-stage={curtain.stage}
          onTransitionEnd={curtainSettled}
          aria-hidden="true"
        >
          <span
            className="article-curtain-plate absolute block origin-top-left bg-violet transition-transform duration-[620ms] ease-panel will-change-transform [transform:translate(0,0)_scale(1)] group-data-[stage=cover]:[transform:translate(var(--curtain-shift-x),var(--curtain-shift-y))_scale(var(--curtain-scale-x),var(--curtain-scale-y))] group-data-[stage=leave]:[transform:translate(var(--curtain-shift-x),var(--curtain-shift-y))_scale(var(--curtain-scale-x),var(--curtain-scale-y))]"
            style={curtain.plateStyle}
            onTransitionEnd={plateSettled}
          />
          <span
            className="article-curtain-title absolute block m-0 text-center font-scene text-paper [overflow-wrap:anywhere] [text-wrap:balance] transition-transform duration-[620ms] ease-panel will-change-transform [transform:translate(0,0)] group-data-[stage=cover]:[transform:translate(var(--title-shift-x),var(--title-shift-y))] group-data-[stage=leave]:[transform:translate(var(--title-shift-x),var(--title-shift-y))]"
            style={curtain.titleStyle}
          >
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

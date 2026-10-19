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
import { navigation } from '@/data/site';

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
  kind: 'article';
  title: string;
  target: string;
  plateStyle: CSSProperties;
  titleStyle: CSSProperties;
};

// Leaving the home page for a first-level page rolls the old page away band by
// band before the route commits; the page's own entrance plays once uncovered.
type RollCurtain = { kind: 'roll'; target: string };

type Curtain = (ArticleCurtain | RollCurtain) & { stage: CurtainStage };

// deploy.re's route curtain: eight bands, 340ms each, entering top-down 28ms
// apart and leaving bottom-up 20ms apart.
const ROLL_BANDS = 8;
const ROLL_DURATION = 340;
const ROLL_ENTER_STAGGER = 28;
const ROLL_EXIT_STAGGER = 20;
const ROLL_COVER_MS = ROLL_DURATION + (ROLL_BANDS - 1) * ROLL_ENTER_STAGGER;
const ROLL_LEAVE_MS = ROLL_DURATION + (ROLL_BANDS - 1) * ROLL_EXIT_STAGGER;
const rollBands = Array.from({ length: ROLL_BANDS }, (_, index) => index);
const rollStyle = {
  '--roll-bands': String(ROLL_BANDS),
  '--roll-duration': `${ROLL_DURATION}ms`,
  '--roll-enter-stagger': `${ROLL_ENTER_STAGGER}ms`,
  '--roll-exit-stagger': `${ROLL_EXIT_STAGGER}ms`,
} as CSSProperties;
const firstLevelRoutes = new Set<string>(navigation.map((link) => link.href));

function shouldRoll(href: string) {
  if (window.location.pathname !== '/') return false;
  let path: string;
  try {
    path = new URL(href, window.location.href).pathname;
  } catch {
    return false;
  }
  return (
    firstLevelRoutes.has(path) &&
    !window.matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)').matches
  );
}

const ROUTE_CURTAIN_LIFTED = 'route-curtain-lifted';

/**
 * Runs `start` once no route curtain covers the page, so a page's entrance
 * plays after the roll rather than under it. Returns a cancel.
 */
export function afterRouteCurtain(start: () => void) {
  if (!document.documentElement.hasAttribute('data-route-curtain')) {
    start();
    return () => {};
  }
  window.addEventListener(ROUTE_CURTAIN_LIFTED, start, { once: true });
  return () => window.removeEventListener(ROUTE_CURTAIN_LIFTED, start);
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
    kind: 'article',
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
  const kind = curtain?.kind;
  useEffect(() => {
    if (curtain?.stage !== 'cover') return;
    const timer = window.setTimeout(finishCover, kind === 'roll' ? ROLL_COVER_MS + 200 : 700);
    return () => window.clearTimeout(timer);
  }, [curtain?.stage, kind, finishCover]);

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

  // The incoming page mounts under the roll with its entrance held (CSS keys on
  // data-route-curtain); once the last band clears, each page plays its own.
  const rolling = kind === 'roll';
  useEffect(() => {
    if (rolling) return;
    const root = document.documentElement;
    if (!root.hasAttribute('data-route-curtain')) return;
    root.removeAttribute('data-route-curtain');
    if (document.querySelector('main.page-shell')) root.dataset.routeEntry = '';
    window.dispatchEvent(new Event(ROUTE_CURTAIN_LIFTED));
  }, [rolling]);

  useEffect(() => {
    const settle = (event: AnimationEvent) => {
      if (event.animationName === 'page-entry')
        document.documentElement.removeAttribute('data-route-entry');
    };
    document.addEventListener('animationend', settle);
    document.addEventListener('animationcancel', settle);
    return () => {
      document.removeEventListener('animationend', settle);
      document.removeEventListener('animationcancel', settle);
    };
  }, []);

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
    const timer = window.setTimeout(
      () => setCurtain(null),
      kind === 'roll' ? ROLL_LEAVE_MS + 200 : 700,
    );
    return () => window.clearTimeout(timer);
  }, [curtain?.stage, kind]);

  function beginCurtain(next: ArticleCurtain | RollCurtain) {
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
    if (shouldRoll(href)) {
      const root = document.documentElement;
      // About's copy stays hidden under the roll; its thread draws once uncovered.
      if (isAboutRoute(href)) root.dataset.aboutEntry = 'drawing';
      root.dataset.routeCurtain = '';
      beginCurtain({ kind: 'roll', target: href });
      return;
    }
    if (isAboutRoute(href) && window.location.pathname !== '/about') {
      // About owns its entrance: the thread draws on an otherwise quiet page
      // instead of arriving behind the generic root crossfade.
      document.documentElement.dataset.aboutEntry = 'drawing';
      router.push(href);
      return;
    }
    const handoff = measureArticleCurtain(href);
    if (handoff) {
      beginCurtain(handoff);
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
  // The last band to enter closes the cover; the top band, last to leave,
  // uncovers the page.
  const rollSettled = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform' || !(event.target instanceof HTMLElement)) return;
    const band = Number(event.target.dataset.band);
    if (curtain?.stage === 'cover' && band === ROLL_BANDS - 1) finishCover();
    else if (curtain?.stage === 'leave' && band === 0) setCurtain(null);
  };

  return (
    <NavigationContext value={navigate}>
      {children}
      {curtain?.kind === 'roll' ? (
        <div
          className="route-roll"
          data-stage={curtain.stage}
          style={rollStyle}
          onTransitionEnd={rollSettled}
          aria-hidden="true"
        >
          {rollBands.map((band) => (
            <span
              className="route-roll-band"
              data-band={band}
              key={band}
              style={{ '--band': band } as CSSProperties}
            />
          ))}
        </div>
      ) : null}
      {curtain?.kind === 'article' ? (
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

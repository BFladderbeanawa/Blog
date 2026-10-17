'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
} from 'react';

const NavigationContext = createContext<((href: string) => void) | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pending = useRef<(() => void) | null>(null);
  const current = useRef<ViewTransition | null>(null);

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

  function navigate(href: string) {
    pending.current?.();
    current.current?.skipTransition();
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

  return <NavigationContext value={navigate}>{children}</NavigationContext>;
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

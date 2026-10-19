'use client';

import { usePathname } from 'next/navigation';
import { RouteLink } from '@/components/site/Navigation';
import { navigation, site } from '@/data/site';

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
    <header className="site-header border-b border-line">
      <div className="site-header-inner mx-auto flex min-h-[88px] max-w-[1440px] flex-wrap items-center justify-between gap-x-10 gap-y-2 px-(--gutter) py-4">
        <RouteLink
          className="site-header-home inline-flex min-h-11 items-center font-scene text-xl font-extrabold tracking-[-0.04em] hover:text-violet hover:underline"
          href="/"
          aria-label={`${site.name} home`}
        >
          {site.name}
        </RouteLink>
        <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Primary navigation">
          {navigation.map((link) => (
            <RouteLink
              className="inline-flex min-h-11 items-center text-sm decoration-2 underline-offset-8 hover:text-violet hover:underline aria-[current]:text-violet aria-[current]:underline"
              key={link.href}
              href={link.href}
              aria-current={
                pathname === link.href
                  ? 'page'
                  : link.href === '/all' && pathname?.startsWith('/posts/')
                    ? 'location'
                    : undefined
              }
            >
              {link.name}
            </RouteLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

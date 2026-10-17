'use client';

import { usePathname } from 'next/navigation';
import { RouteLink } from '@/components/site/Navigation';
import { navigation, site } from '@/data/site';

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname === '/') return null;

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <RouteLink className="site-header-home" href="/" aria-label={`${site.name} home`}>
          {site.name}
        </RouteLink>
        <nav aria-label="Primary navigation">
          {navigation.map((link) => (
            <RouteLink
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

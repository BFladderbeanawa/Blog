import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { CustomCursor } from '@/components/site/CustomCursor';
import { NavigationProvider, RouteLink } from '@/components/site/Navigation';
import { SiteHeader } from '@/components/site/SiteHeader';
import { site, socials } from '@/data/site';
import 'katex/dist/katex.min.css';
import '@fontsource/noto-serif-sc/400.css';
import '@fontsource/noto-serif-sc/600.css';
import './globals.css';

const syne = localFont({
  src: [
    { path: '../../public/fonts/Syne/Syne-Regular.ttf', weight: '400' },
    { path: '../../public/fonts/Syne/Syne-Bold.ttf', weight: '700' },
    { path: '../../public/fonts/Syne/Syne-ExtraBold.ttf', weight: '800' },
  ],
  variable: '--font-syne',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} / Personal archive`, template: `%s / ${site.name}` },
  description: site.description,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: site.name,
    description: site.description,
    locale: 'en_US',
  },
  twitter: { card: 'summary', title: site.name, description: site.description },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={syne.variable}>
      <body>
        <NavigationProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <div className="route-surface">
            <SiteHeader />
            {children}
          </div>
          <footer className="site-footer">
            <RouteLink href="/">BFladderbean</RouteLink>
            <span>A personal archive. Always in progress.</span>
            <div>
              {socials.map((link) => (
                <a href={link.href} key={link.name} target="_blank" rel="noopener noreferrer">
                  {link.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
            <span>© {new Date().getFullYear()}</span>
          </footer>
          <CustomCursor />
        </NavigationProvider>
      </body>
    </html>
  );
}

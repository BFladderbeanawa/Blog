import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { CustomCursor } from '@/components/site/CustomCursor';
import { NavigationProvider, RouteLink } from '@/components/site/Navigation';
import { SiteHeader } from '@/components/site/SiteHeader';
import { site, socials } from '@/data/site';
import 'katex/dist/katex.min.css';
import './globals.css';

const syne = localFont({
  src: [
    { path: '../../public/fonts/Syne/Syne-Regular.ttf', weight: '400' },
    { path: '../../public/fonts/Syne/Syne-Medium.ttf', weight: '500' },
    { path: '../../public/fonts/Syne/Syne-SemiBold.ttf', weight: '600' },
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
    <html lang="en" className={`${syne.variable} scroll-pt-6 bg-paper text-ink`}>
      <body className="font-body text-base leading-[1.55] selection:bg-violet selection:text-paper">
        <NavigationProvider>
          <a
            className="fixed -top-[100px] left-6 z-[10001] bg-ink px-5 py-3 text-paper focus:top-4"
            href="#main-content"
          >
            Skip to content
          </a>
          <div className="min-h-[calc(100svh-178px)]">
            <SiteHeader />
            {children}
          </div>
          <footer className="site-footer mx-(--gutter) flex items-center justify-between gap-6 border-t border-line py-8 text-xs text-muted max-md:[&>span:nth-child(2)]:hidden max-xs:flex-wrap max-xs:text-[11px]">
            <RouteLink href="/" className="font-scene font-bold text-ink hover:text-violet">
              BFladderbean
            </RouteLink>
            <span>A personal archive. Always in progress.</span>
            <div className="flex gap-6">
              {socials.map((link) => (
                <a
                  className="hover:text-violet"
                  href={link.href}
                  key={link.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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

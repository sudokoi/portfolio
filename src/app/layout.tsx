import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { SITE_ORIGIN, SITE_TITLE, indexable } from '@/shared/config/site';
import { WebMcpBridge } from '@/shared/components/WebMcpBridge';
import { MainNavigation } from '@/shared/components/MainNavigation';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: SITE_TITLE, template: `%s | ${SITE_TITLE}` },
  description:
    'Frontend engineering, personal projects, and things learned along the way. By Sudhanshu Ranjan.',
  robots: { index: indexable, follow: indexable },
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const analytics =
    process.env.VERCEL_ENV === 'production' && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  return (
    <html lang="en">
      <head>
        {process.env.WEBMCP_ORIGIN_TRIAL_TOKEN ? (
          <meta httpEquiv="origin-trial" content={process.env.WEBMCP_ORIGIN_TRIAL_TOKEN} />
        ) : null}
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="site-shell">
          <header className="site-header">
            <Link className="brand" href="/" aria-label="Sudhanshu's Corner, home">
              <Image src="/assets/logo.png" width={26} height={36} alt="" priority />
              Sudhanshu
            </Link>
            <MainNavigation />
          </header>
          <main id="main">{children}</main>
          <footer className="site-footer">
            <span>Made by Sudhanshu.</span>
            <nav aria-label="Footer">
              <Link href="/agents" prefetch={false}>
                Agent access
              </Link>
              <a href="/feed.xml">RSS</a>
              <a href="https://github.com/sudokoi/portfolio">[view-source]</a>
            </nav>
          </footer>
        </div>
        <WebMcpBridge />
        {analytics ? (
          <Script
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js'}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            data-domains="sudh.online"
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}

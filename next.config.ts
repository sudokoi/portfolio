import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

const config: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.VERCEL_ENV ?? 'development',
  },
  async redirects() {
    return [{ source: '/blog', destination: '/blogs', permanent: true }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/media/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/search-index.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
    ];
  },
};
export default withSentryConfig(config, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  // Navigation tracing is intentionally disabled for this error-only integration.
  suppressOnRouterTransitionStartWarning: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    deleteSourcemapsAfterUpload: true,
  },
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeTracing: true,
  },
});

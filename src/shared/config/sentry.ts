// Vercel's deployment environment is embedded by next.config.ts for both runtimes.
export const sentryOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  enabled:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === 'production' &&
    Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0,
  enableLogs: false,
  enableMetrics: false,
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
  },
};

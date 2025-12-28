import * as Sentry from "@sentry/cloudflare";

export const onRequest = [
  // Make sure Sentry is the first middleware
  // eslint-disable-next-line no-unused-vars
  Sentry.sentryPagesPlugin((context) => ({
    dsn: "https://5f711f23dca8cae55c3ef1c0dde80b4e@o4507639875239936.ingest.us.sentry.io/4507639877992448",
    sendDefaultPii: true,
    tracesSampleRate: 1,
  })),
  // Add more middlewares here
];

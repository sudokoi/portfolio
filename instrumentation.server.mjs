import * as Sentry from "@sentry/remix";

Sentry.init({
    dsn: "https://5f711f23dca8cae55c3ef1c0dde80b4e@o4507639875239936.ingest.us.sentry.io/4507639877992448",
    tracesSampleRate: 1,
    enableLogs: true
})
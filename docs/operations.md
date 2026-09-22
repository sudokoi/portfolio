# Deployment and measurement

## Vercel Hobby

1. Sign in to Vercel using the GitHub identity owning `sudokoi/portfolio`.
2. Import the **new** repository (ID 1380945820), root directory `.`, framework Next.js, production branch `main`, Node 24.x. `vercel.json` sets a frozen strict-peer install and `pnpm build`; GitHub CI runs full verification.
3. Leave `SITE_INDEXABLE=false` until the domain is ready. No Sanity token is needed in Vercel. Build-time content, original media, code highlighting, discovery files, and OG generation are all local.
4. Inspect the first deployment: `/`, `/blogs`, all active `/blog/<slug>` pages, social images, `/resume`, and `/mcp`. Verify the images load and the MCP SDK can list/call tools.
5. Add `sudh.online` to the Vercel project and follow the DNS records shown by Vercel. Cloudflare may remain the DNS provider. Confirm the old Cloudflare Pages deployment and its old Actions workflow cannot publish over the new site.
6. Set `SITE_INDEXABLE=true` **only in Production**, rebuild, and verify HTTPS, canonical URLs, robots, sitemap, feed, and schema. Preview environments remain noindex even if a flag is accidentally enabled there.
7. Verify an automatic content commit produces a successful Vercel deployment without intervention. Public-repository and owner-attribution rules must be checked on the actual Hobby integration, not assumed from a local build.

The preserved repository is `sudokoi/portfolio-backup-remix` (ID 795814629). Its Cloudflare Actions workflow was disabled during bootstrap. Its source commit and Discussions were retained. Account-side Cloudflare Pages status and DNS are separate launch checks.

## Umami Cloud Hobby

Create one website for `sudh.online` on <https://cloud.umami.is>. Set these Vercel production environment variables:

```text
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<the public website UUID>
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://cloud.umami.is/script.js
```

The tracker loads after hydration only in `VERCEL_ENV=production`, only when a website ID is configured, and is restricted to `sudh.online`. Its automatic history tracking handles Next.js navigation; do not add a second manual page-view event. Previews and localhost do not report visitor data to the production website.

Events: `resume_link_click`, `project_link_click`, `contact_link_click`. Declarative attributes allow the underlying link to work when analytics is blocked. These measure **click intent**, not completed PDF downloads. No email address, arbitrary article body, or visitor identity is attached to custom events.

Confirm a home → blogs → article navigation creates one page view per route, then check the three custom events in the real dashboard. Confirm there is no residual Cloudflare auto-injected beacon or second Vercel tracker. Planning-time Hobby allowances were 100K events/month, one website, six-month retention; recheck the account’s current free allowance before enabling billing or additional services.

Direct `/mcp` traffic does not run browser analytics. Use Vercel request/runtime metrics for that endpoint; no separate paid telemetry service is configured.

## Sentry error monitoring

Create a Next.js project in Sentry and add the following Vercel **Production** variables:

```dotenv
NEXT_PUBLIC_SENTRY_DSN=<Project Settings → Client Keys (DSN)>
SENTRY_ORG=<organization slug>
SENTRY_PROJECT=<project slug>
SENTRY_AUTH_TOKEN=<secret source-map upload token>
```

Use Sentry's suggested organization auth token for source-map uploads (`org:ci` scope). Keep it in Vercel, not source control or a public-prefixed variable. Redeploy after setting the variables. The DSN is public configuration; the upload token is a build-time secret.

Browser exceptions, unhandled rejections, React render failures, and server request errors are captured. The environment comes from `VERCEL_ENV`; previews, local development, and builds without a DSN do not initialize reporting. Tracing, session replay, logs, and metrics are disabled. Automatic user identity, cookies, HTTP headers/bodies, and URL query parameters are excluded from SDK collection.

Authenticated builds upload source maps and delete the uploaded maps from the output. Without an upload token, the build still succeeds and error reporting can work with the DSN, but minified browser stack traces may lack original-source context. Source-map upload failures fail the configured build so missing maps are visible during deployment.

Check the Sentry Issues dashboard after a controlled test error and confirm its environment is `production` and its stack resolves to source. Use the intercepted-envelope browser smoke test below before enabling the live DSN; it sends no event to Sentry:

```sh
VERCEL_ENV=production NEXT_PUBLIC_SENTRY_DSN=https://public@example.invalid/1 pnpm build
VERCEL_ENV=production NEXT_PUBLIC_SENTRY_DSN=https://public@example.invalid/1 pnpm test:e2e tests/e2e/sentry.spec.ts --project=chromium
```

## Google and Bing

- Verify a domain property in Google Search Console, preferably with its DNS TXT record.
- Verify the domain in Bing Webmaster Tools (or import the verified Search Console property).
- If HTML verification is preferred, set `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` and rebuild.
- Submit `https://sudh.online/sitemap.xml` and inspect the home page plus one article after cutover.
- Recheck indexing/coverage after crawlers have revisited. Ranking changes and field Core Web Vitals need actual traffic/time; a successful deployment alone does not establish them.

## Agent access

Connect a current MCP client or MCP Inspector to `https://sudh.online/mcp` using Streamable HTTP. No authentication is required. All tools are read-only and use the same deployment snapshot as the rendered pages.

Native browser WebMCP uses `document.modelContext.registerTool` with AbortSignal cleanup. It is experimental; supported browsers register search/navigation tools, unsupported browsers do nothing. To expose it publicly while an origin trial is required, register `https://sudh.online` via [Chrome’s WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp) and set `WEBMCP_ORIGIN_TRIAL_TOKEN`. Local verification used native Chrome 153 with WebMCP enabled through agent-browser, not just a mock API.

## Performance

```sh
pnpm build
pnpm start
# In another terminal:
pnpm perf:check
```

The check uses Chromium, cold cache, 390×844, 4× CPU slowdown, 1.6 Mbps down / 750 Kbps up / 150 ms latency, three runs per route. It saves raw results to `test-results/performance.json` and fails on median LCP >2.5 s or CLS >0.1. Set `PERF_URL` to measure a hosted origin.

`maxInteraction` records tested interactions, not field INP. Production INP ≤200 ms should be assessed from field data when available. Lab transfer figures exclude the navigation HTML and should not be reported as total page weight.

## Optional work

Private draft preview is deferred. Public publishing and editing work through standard Sanity draft/save/publish behavior. A future preview must use a separate authorized, no-store/noindex read path and must never alter public snapshots, search, metadata, or MCP responses.

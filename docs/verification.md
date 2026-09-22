# Verification evidence

Implementation date: 2026-09-22. Local environment: macOS arm64, Node 24.12.0, pnpm 12.5.1. CI/toolchain target: Node 24.21.0 LTS. The implementation uses Next 16.3.5, React 19.3.0, Sanity 6.15.0, TypeScript 6.0.3 and ESLint 9.39.5; the latter two are selected for supported lint-plugin peer ranges.

## Local checks

- Strict peer dependency installation passed; a frozen-lockfile install is part of release validation and CI.
- Next.js production build passed with static home, blog index, all six articles, all seven OG images, resume PDF, RSS, robots and sitemap. `/mcp` and legacy image redirects are small route handlers.
- Studio typecheck/build passed. This proves the editor compiles; a real Sanity account connection and authoring round-trip remain pending.
- Vitest covers schema rejection, drafts/versions, deterministic export, missing/truncated media, stable slugs, unpublishing, content-only Git commits, stale bases, restore remapping, original MDX dates/code/galleries/tables/demos, and search.
- Production browser checks cover all six articles without JavaScript, canonical/OG/JSON-LD data, real PNG image dimensions, feed/sitemap membership, 404s/redirects, lazy search, PDF bytes, tracking attributes, and a standards-shaped WebMCP test adapter.
- All 14 production browser tests passed. axe checks passed on home, index, all six articles, and agent instructions at 320, 390, 768, and 1440 CSS pixels. Keyboard skip navigation, reduced motion, and document overflow checks passed. Code uses GitHub’s high-contrast dark theme; long article titles wrap at narrow widths.
- The actual MCP v2 client connected over HTTP, listed the four read-only tools, fetched profile/article/resume data, and exercised invalid IDs/input and origin rejection.
- Native Chrome 153 through agent-browser discovered `search_posts` and `open_article`; search returned the halo article and the navigation tool opened its canonical local route. This is native browser evidence in addition to mocked lifecycle checks. Production origin-trial setup is pending.
- Desktop homepage, mobile blog index, halo demonstrations, and the long Expense Buddy OG card were visually inspected. Temporary screenshots and browser traces live under ignored `test-results/`.

## Fixed-profile mobile lab sample

Production localhost server, Chromium 153.0.8010.12, 390×844, cold cache, 4× CPU, 1.6 Mbps down / 750 Kbps up / 150 ms latency, median of three runs:

| Route                 |    LCP | CLS | Observed interaction |
| --------------------- | -----: | --: | -------------------: |
| `/`                   | 456 ms |   0 |        Not exercised |
| `/blogs`              | 452 ms |   0 |                32 ms |
| `/blog/expense-buddy` | 456 ms |   0 |        Not exercised |

These are local lab results, not deployed CDN measurements or field INP. JavaScript transfer in this sample was approximately 143 KB compressed; HTML is excluded from the script/resource byte figures. The raw report is produced by `pnpm perf:check`; rerun against production after account setup/cutover.

## Pending hosted evidence

### Completed service setup

- Initial implementation pushed as `f042f67`; [GitHub CI run 35697905758](https://github.com/sudokoi/portfolio/actions/runs/35697905758) passed all gates on Linux, including production browser tests.
- Sanity `production` dataset imported with all six posts, the profile singleton, and 15 original assets. The dataset originally contained only reserved Sanity system documents; those were preserved.
- Studio deployed with schema validation to <https://sudh-portfolio.sanity.studio/> (application ID `bywe25l4l1yblljr29x5mop6`).
- A live authenticated export passed byte-size and SHA-1/SHA-256 validation with digest `aa854ddd145cd6d4fe52bc3f5687e20a0a5906219d81bf8c636dcd2cc7b4524c`. Raw asset downloads use `dlRaw`; ordinary CDN image URLs may strip original metadata.
- GitHub publishing/author secrets and a Sanity viewer-role export token are configured. [Publication run 35698527190](https://github.com/sudokoi/portfolio/actions/runs/35698527190) exported, validated, built, and pushed snapshot commit `063ae16` with the imported Sanity asset IDs. Original media files did not change.
- The published-only Sanity webhook is configured for create/update/delete. A semantic no-op update to the profile triggered [repository dispatch run 35698767887](https://github.com/sudokoi/portfolio/actions/runs/35698767887), which passed and reported “Published content unchanged; no commit or build needed.” The [content commit's CI run 35698623964](https://github.com/sudokoi/portfolio/actions/runs/35698623964) also passed. Vercel is not connected yet.

The owner supplied Sanity project `7vbp91cq`, Umami website `9c1d80c6-2a8e-4925-b2a4-fbdbea343dae`, and the GitHub publishing credential; these are configured locally. The repository is pushed and ready for Vercel connection; the owner will perform DNS migration after deployment. Do not interpret local checks as proof of the following:

- Real Studio draft/save/reopen/manual-publish behavior in a signed-in browser.
- Direct Sanity webhook acceptance, owner-PAT publication, automatic Vercel deployment, no-op replay, unpublish propagation and resume replacement.
- Failed deployment retention and hosted rollback/reconciliation rehearsal.
- Vercel Hobby/domain binding, HTTPS, Cloudflare Pages account-side shutdown, and production indexing flag.
- Actual Umami page-view deduplication/custom events, search property ownership, sitemap submission, and indexing.
- Production WebMCP origin-trial registration and hosted mobile performance.

Record the final Git content digest, deployed commit/URL, hosted verification results and account setup here when completed. Keep the authoritative plan while any required launch step is blocked.

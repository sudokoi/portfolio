<!-- companion-to-plan id=02c092ed-1d58-4768-b9da-20b1d6a12565 -->

# Next.js portfolio rebuild — implementation todos

Execution checklist for the approved plan, ID `02c092ed-1d58-4768-b9da-20b1d6a12565`, retained at `/Users/sudhanshu/code/portfolio-backup-remix/.scratch/to-plan/nextjs-portfolio-rebuild.md`. The plan defines behavior, boundaries, tests, and acceptance criteria.

## Current verification status — 2026-09-22

The local implementation includes the migrated six-post snapshot and 15 original assets, Next.js site, Sanity Studio schemas, publishing pipeline, restore tooling, MCP/WebMCP, SEO/OG/feed/search, and analytics integration. Prettier uses single quotes and Next.js ESLint recommendations. The latest production browser run passed all 14 tests, including every article at four viewport widths. The high-contrast syntax theme and wrapping of long article titles fixed issues found by those checks.

The owner supplied the Sanity project and Umami website IDs, now configured locally. Vercel setup follows the repository push; the owner will handle DNS after deployment. Hosted publication, analytics dashboard verification, and search ownership remain unverified. Checked items below have local evidence; mixed local/hosted requirements remain open until both are verified. See [verification evidence](verification.md).

Source baseline: `main` at `86c4bd5a0d284fd696861e027b86ecbdf3d75611`, GitHub repository ID `795814629`.

## 1. Fresh repository and baseline

- [x] Recheck source SHA/status, GitHub ownership, and destination name/folder availability.
- [ ] Confirm Cloudflare Pages shutdown and disable the legacy Actions deployment workflow if still active.
- [x] Rename the existing GitHub repository to `sudokoi/portfolio-backup-remix`.
- [x] Update its local origin and move the checkout to `/Users/sudhanshu/code/portfolio-backup-remix`.
- [x] Create a NEW public `sudokoi/portfolio` and clone it into `/Users/sudhanshu/code/portfolio`.
- [x] Verify the old repository retains ID `795814629` and the new repository has a different ID.
- [x] Record the plan's relocated path under `portfolio-backup-remix`; work from the new checkout.
- [x] Copy this checklist to `docs/implementation-todos.md` in the new repository, retaining the plan ID.
- [x] Scaffold current stable Next.js App Router, React, Tailwind, strict TypeScript, and flat ESLint configuration.
- [ ] Resolve latest compatible dependencies; pin Node LTS and pnpm; commit the lockfile.
- [x] Add scripts, test harnesses, README, `.env.example`, and source-content inventory.
- [x] Establish green lint, typecheck, production build, and browser smoke checks.

## 2. Versioned published-content foundation

- [x] Define post, profile, Portable Text block, asset, and manifest validation contracts.
- [x] Add the server-only snapshot reader and small public module interfaces.
- [x] Add a representative article containing code, a screenshot, and a table.
- [x] Render the representative article without a live CMS connection or required browser JavaScript.
- [x] Test invalid dates, duplicate/changed slugs, draft/version exclusion, and missing assets.
- [x] Make invalid snapshots fail the build and unknown article URLs return HTTP 404.

## 3. Sanity editor and export

- [ ] Create the free Sanity project/dataset and separately hosted Studio workspace.
- [x] Add post/profile schemas and code, image/caption, table, gallery, linked-image, and demo blocks.
- [ ] Verify draft save/reopen, manual publishing, and date editing.
- [x] Implement deterministic published-only document export with explicit projections.
- [x] Download referenced original media into content-addressed GitHub-backed files.
- [x] Verify media size/hash/dimensions and reject incomplete exports.
- [x] Test deterministic/no-op exports, failed assets, unpublishing, and stable manifests.
- [ ] Publish/export the representative real article and verify local rendering parity.

## 4. Automatic publishing and deployment

- [x] Add CI for lint, typecheck, content/pipeline tests, production build, and browser checks.
- [x] Add `publish-content.yml` for published-content dispatch, manual recovery, and daily reconciliation.
- [x] Configure a serialized export that validates/builds before committing.
- [x] Prevent stale pushes, partial commits, arbitrary staged files, and export recursion.
- [ ] Configure the direct Sanity webhook to GitHub repository_dispatch for published create/update/delete.
- [ ] Configure the repository-scoped dispatch/push credentials and verified owner Git identity.
- [ ] Connect Vercel Hobby to the NEW repository ID and `main`, with the validation build command.
- [ ] Prove a real publish automatically reaches GitHub and Vercel without a PR.
- [ ] Prove duplicate notifications produce no unnecessary commit/deployment.
- [ ] Prove a failed export leaves the last successful snapshot/deployment intact.
- [x] Document token renewal, failure notifications, manual rerun, and disabled-schedule recovery.

## 5. Migrate and verify content

- [x] Build a dry-run-first MDX AST migration with explicit handling of known constructs.
- [x] Preserve/import `expense-buddy`, `og-image`, `halo-effect`, `improving-lcp`, `use-imperative-handle`, and `weird-google-autocomplete`.
- [x] Preserve titles, source publication dates, prose, links, code text, tables, and captions.
- [x] Recreate the halo demonstrations as approved CSS demo presets.
- [x] Migrate screenshots/galleries, logo, diagrams, linked badge, and resume originals.
- [x] Preserve old public asset paths where needed.
- [ ] Seed profile/experience/projects/skills/links/resume in Sanity, or document the permitted code-authored fallback.
- [x] Add migration fixtures/inventory so CI does not depend on the backup checkout.
- [x] Compare every migrated post against the source and record pre-existing editorial inconsistencies.
- [ ] Verify import/export round-trip and a media-inclusive restore dry run.

## 6. Design, reading experience, and accessibility

- [x] Preserve the logo, monospace-led styling, palette family, personal voice, and `/blogs` navigation.
- [x] Implement homepage, blog index, and readable article layouts.
- [ ] Use normal document scrolling and reliable anchor/back navigation.
- [x] Add semantic headings, skip link, accessible icon names, and visible focus states.
- [x] Add intrinsic image dimensions, responsive variants, and below-fold lazy loading.
- [x] Highlight code on the server/build; contain wide code and tables without page overflow.
- [x] Implement reduced-motion treatment for live demonstrations/effects.
- [x] Verify 320, 390, 768, and 1440 pixel layouts, keyboard navigation, and no-JS reading.
- [ ] Implement `/resume` with current bytes and correct caching; verify replacement behavior.
- [x] Keep initial delivery free of Giscus, Sentry tracing, heavy animation, and Studio bundles.

## 7. OG, SEO, and feeds

- [x] Implement one branded 1200x630 `next/og` template using local OG font assets.
- [x] Generate site/post images from the same published snapshot.
- [x] Verify long-title rendering, binary dimensions/MIME, and missing-slug behavior.
- [x] Redirect legacy `/og/*.jpeg` URLs to the new images.
- [x] Centralize canonical, title, description, Open Graph, and Twitter metadata.
- [x] Add matching ProfilePage/Person, BlogPosting, and breadcrumb JSON-LD.
- [x] Generate sitemap, robots, RSS, related articles, and previous/next links.
- [x] Keep preview deployments noindex and production canonicals consistent.
- [ ] Test all six URLs, feed/XML parsing, structured data, and compatibility redirects.

## 8. Search and agent access

- [x] Build deterministic bounded text search and a lazy-loaded public search index.
- [x] Add useful progressively enhanced article search.
- [x] Implement public `/mcp` with current stateless MCP handler/SDK versions.
- [x] Expose `get_profile`, `search`, `fetch`, and `get_resume` with structured/text responses.
- [x] Test invalid IDs/inputs, empty results, draft exclusion, canonical URLs, and page/tool parity.
- [ ] Verify every tool with the real MCP client SDK and Inspector.
- [x] Add `/agents` connection instructions and capability descriptions.
- [x] Add feature-detected WebMCP `search_posts` / `open_article` with current API/lifecycle handling.
- [ ] Test unsupported browsers, cleanup, bounded internal navigation, and lazy index loading.
- [x] Verify native WebMCP with documented Chrome flags/origin trial; record browser/API versions.

## 9. Free analytics and discovery measurement

- [ ] Create an Umami Cloud Hobby website and configure one production-only tracker.
- [ ] Track page views and resume/project/contact link clicks without sensitive event properties.
- [ ] Test client navigation deduplication, preview exclusion, and blocked-tracker behavior.
- [ ] Confirm real events in Umami and absence of duplicate Cloudflare/Vercel trackers.
- [ ] Verify Google Search Console and Bing Webmaster Tools properties.
- [ ] Submit the sitemap and inspect homepage/article indexing after cutover.
- [x] Document browser traffic versus separate server-side MCP request metrics.

## 10. Release and operational handoff

- [ ] Run strict frozen install, content validation, restore dry run, lint, typecheck, tests, Studio build, and Next production build.
- [ ] Run the full production-route/browser suite and inspect public client bundles.
- [x] Measure three-run mobile medians with the plan's fixed CPU/network/viewport profile.
- [x] Meet LCP/CLS targets, inspect interaction responsiveness, and record transfer/JS sizes and environment.
- [x] Verify all public pages and MCP use bundled content with CMS access unavailable.
- [ ] Rehearse export failure, deployment failure, snapshot rollback, and CMS reconciliation.
- [ ] Attach `sudh.online` to Vercel and verify HTTPS, URLs, canonicals, robots, OG, PDF, and MCP.
- [ ] Verify one real automatic publication and one no-op notification after cutover.
- [ ] Record deployed commit/snapshot, service setup, limitations, deferred optional work, and test evidence.
- [x] Preserve `portfolio-backup-remix` and its history/Discussions.
- [ ] Delete only the authoritative scratch plan after successful implementation; preserve it on blockers.

## Optional, non-blocking

- [ ] Add a private draft Preview action if integration is straightforward.
- [ ] If preview is implemented, prove draft isolation, noindex/no-store, and unchanged public content before publication.
- [x] Explicitly record preview as deferred if omitted; it does not block release.

## Account-side setup dependencies

- [x] GitHub account can rename/create the two personal public repositories.
- [ ] Legacy Cloudflare deployment is disabled by the owner or verified during bootstrap.
- [ ] Sanity Free account/project/dataset and included Studio hosting are available.
- [ ] One-time Sanity import authorization is available; write credentials stay out of public delivery/export.
- [ ] Fine-grained GitHub token(s) are scoped to the NEW repo and permit dispatch/content publication.
- [ ] GitHub Actions and unattended content commits are permitted by repository rules.
- [ ] Vercel Hobby account is connected to the correct GitHub identity and NEW repository.
- [ ] Umami Cloud Hobby website exists; public tracker ID/script URL are configured.
- [ ] Domain/DNS access is available for Vercel cutover and Search Console/Bing verification.
- [ ] A WebMCP origin-trial registration is available if still needed for production browser exposure.

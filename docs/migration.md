# Migration provenance

Source: `sudokoi/portfolio-backup-remix`, GitHub repository ID `795814629`, `main` at `86c4bd5a0d284fd696861e027b86ecbdf3d75611`.

Destination: new public `sudokoi/portfolio`, GitHub repository ID `1380945820`. The new checkout has independent history. The source checkout remains at `/Users/sudhanshu/code/portfolio-backup-remix` with its origin explicitly updated; the new repository reuses the old name, so the old GitHub name redirect cannot identify the backup reliably.

## Preserved articles

| Slug                        | Original calendar date |
| --------------------------- | ---------------------- |
| `expense-buddy`             | 2026-01-16             |
| `og-image`                  | 2024-09-04             |
| `halo-effect`               | 2024-05-16             |
| `improving-lcp`             | 2024-05-16             |
| `use-imperative-handle`     | 2024-05-13             |
| `weird-google-autocomplete` | 2024-05-07             |

The migration parses MDX into an AST without evaluating imports, route exports, or expressions. Frontmatter owns title/description/date. Known timestamp/tag/title wrappers move to article metadata. Prose, inline marks and links, code text, lists, figures/captions, table cells, galleries, linked badge, and approved CSS demo variants become Portable Text/structured blocks.

Human-readable source dates are parsed as calendar dates, not local-midnight instants; regression tests assert the exact six original ISO dates. No modification dates were invented.

The initial snapshot includes **15 referenced original assets**, including the PDF and a local copy of the Google Play badge. The original `public/assets` tree is retained for compatibility, including preload-only screenshots. The halo logo remains at `/assets/logo.png`; the code for live demos is part of the app, not executable CMS content.

Five demo instances preserve the solution, prominent pink halo, both failed attempts, and final solution. The Expense Buddy galleries preserve twelve image instances using its seven unique screenshots. The LCP table preserves its header and four data rows.

## Repeatable validation

```sh
pnpm migrate:legacy --source ../portfolio-backup-remix --dry-run
pnpm test tests/migration
pnpm content:validate
pnpm restore:content --dry-run
```

`--apply` is for a fresh initial migration only and refuses collisions. Ordinary builds/tests use committed fixtures in `tests/fixtures/legacy`, not a sibling checkout. Normal content updates come through Sanity exports.

The fixtures retain historical code **as article text**, including examples and links mentioning old frameworks or APIs. They are not current build dependencies or recommended implementation patterns.

## Intentional changes and editorial follow-up

- The homepage’s Portfolio & Blog project description now names the actual Next.js/Sanity implementation.
- Missing image alt text is derived from the original figure caption or descriptive filename.
- Current source quirks were not silently rewritten: Expense Buddy’s description says “internal testing” while its body says it is available on Google Play. The Aptus Data Labs entry links to `paytm.com` in the source. These are editorial follow-up items for the owner.
- The old fixed-height inner scroller is replaced with normal document scrolling. Essential reading and navigation work without JavaScript.
- Giscus and full client-side tracing are omitted. Existing Discussions remain in the preserved repository.
- Legacy `/og/<slug>.jpeg` and `/og/index-og-image.jpeg` redirect to generated PNG endpoints. `/blog` redirects to `/blogs` with its query string.

The implementation plan remains at `/Users/sudhanshu/code/portfolio-backup-remix/.scratch/to-plan/nextjs-portfolio-rebuild.md`, ID `02c092ed-1d58-4768-b9da-20b1d6a12565`, until all account-side launch work succeeds.

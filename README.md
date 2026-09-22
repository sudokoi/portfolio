# Sudhanshu’s Corner

A personal frontend-engineering journal and portfolio at [sudh.online](https://sudh.online).
Built with Next.js App Router, React, TypeScript, and Tailwind. Public pages are pre-rendered from a verified, versioned content snapshot.

## Develop

Use the Node LTS version in `.node-version` and pnpm version in `package.json`.

```sh
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm dev
```

The website runs at `http://localhost:3000`. A Sanity account or token is **not** required to build or read the site.

```sh
pnpm format          # Prettier
pnpm format:check    # formatting gate
pnpm lint            # Next.js Core Web Vitals + TypeScript ESLint rules
pnpm lint:fix
pnpm typecheck       # site, scripts, tests, and Studio
pnpm test            # content, migration, publishing, restore, search
pnpm verify          # format + lint + types + tests + production build
pnpm studio:build
pnpm exec playwright install chromium
pnpm test:e2e        # starts the production server; run pnpm build first
```

ESLint follows [Next.js’s recommended flat configuration](https://nextjs.org/docs/app/api-reference/config/eslint), with `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`, and `eslint-config-prettier/flat`. Prettier handles formatting separately. CI checks both. Generated snapshots have their own deterministic serializer and are excluded from Prettier.

## Content and publishing

```text
Sanity Studio → published documents → GitHub Actions
             → validated JSON + original media → atomic content commit
             → Vercel build → pages / OG / RSS / sitemap / search / MCP
```

Sanity is the authoring source of truth. Git contains the successful published versions and original referenced media. This is one-way publishing, not bidirectional editing.

- [`studio/`](studio/) configures Sanity’s editor, including tables, code, galleries, CSS demo presets, profile, and resume.
- [`content/published/`](content/published/) contains the active snapshot and asset manifest.
- [`public/media/`](public/media/) contains content-addressed originals.
- [`src/modules/`](src/modules/) contains content, portfolio, blog, discovery, and agent features.
- [`scripts/`](scripts/) owns migration, export, publication, validation, and restoration.

Start with **[publishing setup](docs/publishing.md)** to connect your Sanity and Vercel accounts. Builds work before that configuration; the publishing workflow remains inactive until `SANITY_PROJECT_ID` is configured.

## Public interfaces

| URL                           | Purpose                               |
| ----------------------------- | ------------------------------------- |
| `/`                           | Portfolio                             |
| `/blogs`                      | Journal and on-demand search          |
| `/blog/<slug>`                | Published articles                    |
| `/resume`                     | Stable current PDF URL                |
| `/feed.xml`                   | RSS                                   |
| `/sitemap.xml`, `/robots.txt` | Search discovery                      |
| `/mcp`                        | Public, read-only Streamable HTTP MCP |
| `/agents`                     | Connection instructions               |

MCP tools: `get_profile`, `search`, `fetch`, and `get_resume`. Browser-native WebMCP progressively exposes `search_posts` and `open_article` when supported. No LLM, Redis, vector storage, or client-side MCP SDK is needed.

## Operations

- [Publishing and recovery](docs/publishing.md)
- [Deployment, analytics, and search setup](docs/operations.md)
- [Migration provenance](docs/migration.md)
- [Verification evidence](docs/verification.md)
- [Implementation checklist and pending account work](docs/implementation-todos.md)

The preserved Remix implementation is [sudokoi/portfolio-backup-remix](https://github.com/sudokoi/portfolio-backup-remix). This repository has independent Git history. Existing article slugs, media paths, and CSS demonstrations were retained.

## Font attribution

The social-image renderer embeds JetBrains Mono under its [SIL Open Font License](src/modules/seo/fonts/OFL.txt). Public pages use the platform monospace font stack and download no web font.

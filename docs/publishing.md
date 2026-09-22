# Publishing and recovery

## Initial Sanity setup

1. Create a **Free** Sanity project with a `production` dataset at <https://www.sanity.io/manage>. A public dataset is sufficient; exports explicitly select published website documents. Keep drafts/version documents excluded regardless of dataset visibility.
2. Copy `.env.example` to `.env.local`. Set `SANITY_PROJECT_ID` and `SANITY_DATASET`. Add a temporary write token as `SANITY_WRITE_TOKEN` for the initial import. Local export/restore scripts load this file. Never commit tokens.
3. Copy `studio/.env.example` to `studio/.env.local` and set the matching `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET`. These IDs are public, not credentials.
4. Run `pnpm restore:content --dry-run`, then `pnpm restore:content --apply` against the **fresh** dataset. Restoration refuses a dataset with existing non-asset documents, uploads original binaries, adds the required Sanity object types/keys, remaps every media reference, and creates the six posts and profile in one transaction. If upload fails before the transaction, there may be orphaned uploaded assets; rerunning is safe while no documents have been created.
5. Run `pnpm --filter portfolio-studio exec sanity login`, then `pnpm studio:dev`. Verify a post’s code language, captions, gallery, table cells, dates, and demo presets. The profile is a singleton with a PDF upload field.
6. Deploy with `pnpm --filter portfolio-studio exec sanity deploy`, selecting included `sanity.studio` hosting. Add the deployed Studio origin and `http://localhost:3333` to the project’s permitted CORS origins as needed.
7. Remove the one-time write token from your local environment after import. Normal publishing never needs write access to Sanity.

`studio:build` can compile without a project connection using an explicit `unconfigured` project ID. That is a configuration placeholder, not a working hosted CMS. Fill in the IDs before using/deploying Studio.

For initial import using an existing local Sanity CLI login instead of a separate write token:

```sh
pnpm --filter portfolio-studio exec sanity exec scripts/restore-content.ts --with-user-token
pnpm --filter portfolio-studio exec sanity exec scripts/restore-content.ts --with-user-token -- --apply
```

The first command is a dry run. The second imports only into a dataset without user documents; Sanity's reserved internal system documents are left intact. The wrapper passes the authenticated credential in process memory without writing it to disk.

## GitHub automation setup

The new public repository is **`sudokoi/portfolio`**, repository ID **1380945820**. Configure tokens and service integrations for this ID, not the preserved repository ID 795814629.

Create fine-grained owner tokens scoped only to the new repository, with **Contents: read and write**. One token can work for both webhook dispatch and snapshot pushes; separate tokens simplify independent rotation. Use a verified email associated with the Vercel/GitHub owner for generated commits.

Repository Actions configuration:

| Name                    | Kind     | Use                                                        |
| ----------------------- | -------- | ---------------------------------------------------------- |
| `SANITY_PROJECT_ID`     | Variable | Enables publishing and selects the project                 |
| `SANITY_DATASET`        | Variable | Usually `production`                                       |
| `CONTENT_GIT_NAME`      | Variable | Owner Git author name                                      |
| `CONTENT_GIT_EMAIL`     | Secret   | Verified owner Git email                                   |
| `CONTENT_PUBLISH_TOKEN` | Secret   | Owner PAT used for checkout and ordinary content pushes    |
| `SANITY_READ_TOKEN`     | Secret   | Read-only token for authenticated original-asset downloads |

Allow direct content pushes to `main` from the configured owner token. The accepted publishing flow does not require a PR or manual approval. The workflow commits only `content/published/**` and `public/media/**`. PR verification jobs have no publication secret.

## Sanity webhook

Configure one GROQ webhook in the project API settings:

- URL: `https://api.github.com/repos/sudokoi/portfolio/dispatches`
- Method: `POST`
- Trigger: published document create, update, and delete.
- Disable draft and release-version triggers.
- Filter:

```groq
_type in ["post", "profile"] && !(_id in path("drafts.**")) && !(_id in path("versions.**"))
```

- Projection:

```json
{ "event_type": "sanity-published" }
```

- Headers: `Authorization: Bearer <repository-scoped dispatch token>`, `Accept: application/vnd.github+json`, `Content-Type: application/json`, and GitHub’s supported `X-GitHub-Api-Version` (currently `2022-11-28`). Keep the token in the webhook configuration, not the repository.

Verify delete/unpublish notifications with Sanity’s webhook test/history UI. A GitHub **204** means the dispatch request was accepted, not that an export or deployment has succeeded. The workflow must exist on `main` and be enabled.

## Publication behavior

`Publish Sanity content` handles `repository_dispatch`, manual `workflow_dispatch`, and daily reconciliation at 06:17 UTC. It serializes executions with cancellation disabled. GitHub may coalesce pending runs; every run exports the latest published state, ignoring event document payloads.

Each attempt:

1. Fetches `main` into a private disposable worktree and installs its locked toolchain dependencies.
2. Queries only published post/profile documents, bypassing the Sanity CDN.
3. Downloads referenced originals only from the configured Sanity project/dataset. Verifies source size/checksum, binary format, dimensions, and SHA-256 filenames; a missing asset fails the attempt.
4. Writes a temporary complete snapshot, validates its document/asset inventory and semantic digest, and checks that existing source IDs retain their slugs.
5. If the digest is unchanged, exits without a build or commit. Revision-only/timestamp changes do not produce needless commits.
6. Replaces generated content in the disposable checkout and runs `pnpm verify` against it.
7. Confirms the remote base is current, creates one content-only commit, and pushes normally. If `main` advances, discards the disposable worktree and restarts from the latest `main`, up to three attempts. It never force-pushes or blindly rebases an old export.

The owner PAT permits push-based CI and Vercel integration to observe the generated commit. `GITHUB_TOKEN` pushes suppress ordinary push-triggered Actions, so they are not used for this workflow.

Unpublished articles disappear from the current snapshot, feed, search, sitemap, and MCP together. Old snapshots remain in Git history. A deliberate slug rename needs a separate redirect migration; the normal export rejects it.

## Validation and recovery

```sh
pnpm content:validate
pnpm content:export --dry-run
pnpm restore:content --dry-run
gh workflow run publish-content.yml --repo sudokoi/portfolio
```

The export command always runs as a local dry run; it never replaces your active snapshot. `content:publish` is restricted to an isolated Actions checkout.

- **Failed export:** no publication commit. Correct the indicated document, token, or missing asset and rerun the workflow.
- **Rejected push:** after bounded retries, inspect `main` and rerun; never force-push.
- **Failed Vercel build:** previous successful production stays live. Inspect the deployment’s build log and fix the cause.
- **Missing notification:** manual dispatch or the reconciliation schedule exports the current state. GitHub may disable scheduled workflows after prolonged inactivity; re-enable the workflow before rerunning.
- **Token expiry:** replace the appropriate webhook/Actions token and run a manual export.
- **Rollback:** redeploy a known-good Vercel deployment/snapshot. Also correct or restore the corresponding Sanity content before the next automated export; Git-only edits are intentionally overwritten by Sanity.
- **Lost CMS project:** create a fresh dataset and run `restore:content --apply` with its write token. This reconstructs published website documents and original assets. Drafts, unpublished versions, comments, and unrelated Sanity data are outside this backup.

Enable GitHub Actions and Vercel failure notifications for the owner. After setup, prove a real Studio publish, a no-op replay, unpublish/re-publish, and a resume replacement. Record the resulting Git commit and Vercel deployment in `docs/verification.md`.

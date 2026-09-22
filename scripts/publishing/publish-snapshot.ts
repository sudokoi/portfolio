import { cp, readFile, rm, mkdir, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { exportContent, liveSource, type ExportSource } from './export-content';
import { readSnapshot } from './snapshot';
import { git, commitContent } from './git';

class MainAdvanced extends Error {}

export async function publishAttempt(
  root: string,
  options: { source?: ExportSource; verify?: (root: string) => void } = {},
) {
  if (process.env.GITHUB_ACTIONS !== 'true')
    throw new Error(
      'Publication runs only in the isolated GitHub Actions checkout. Use content:export for a local dry run.',
    );
  if (git(root, 'status', '--porcelain')) throw new Error('Publication requires a clean checkout');
  const head = git(root, 'rev-parse', 'HEAD');
  git(root, 'fetch', 'origin', 'main');
  if (git(root, 'rev-parse', 'origin/main') !== head)
    throw new MainAdvanced('Main advanced before export.');
  const current = await readSnapshot(root);
  const { stage, digest } = await exportContent(root, options.source ?? liveSource(), current);
  try {
    const previous = JSON.parse(
      await readFile(path.join(root, 'content/published/manifest.json'), 'utf8'),
    ) as { digest: string };
    if (digest === previous.digest) {
      console.log('Published content unchanged; no commit or build needed.');
      return;
    }
    for (const directory of ['content/published', 'public/media']) {
      await rm(path.join(root, directory), { recursive: true });
      await cp(path.join(stage, directory), path.join(root, directory), { recursive: true });
    }
    if (options.verify) options.verify(root);
    else execFileSync('pnpm', ['verify'], { cwd: root, stdio: 'inherit' });
    git(root, 'fetch', 'origin', 'main');
    if (git(root, 'rev-parse', 'origin/main') !== head)
      throw new MainAdvanced('Main advanced during validation.');
    if (commitContent(root, head)) {
      try {
        git(root, 'push', 'origin', 'HEAD:main');
      } catch (error) {
        git(root, 'fetch', 'origin', 'main');
        if (git(root, 'rev-parse', 'origin/main') !== head)
          throw new MainAdvanced('Main advanced before push.');
        throw error;
      }
    }
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}

export async function publishSnapshot(root: string) {
  if (process.env.GITHUB_ACTIONS !== 'true')
    throw new Error('Publication is restricted to the isolated Actions checkout.');
  if (git(root, 'status', '--porcelain')) throw new Error('Publication requires a clean checkout');
  await mkdir(path.join(root, '.staging'), { recursive: true });
  for (let attempt = 1; attempt <= 3; attempt++) {
    git(root, 'fetch', 'origin', 'main');
    const parent = await mkdtemp(path.join(root, '.staging/publish-'));
    const checkout = path.join(parent, 'checkout');
    git(root, 'worktree', 'add', '--detach', checkout, 'origin/main');
    try {
      execFileSync('pnpm', ['install', '--frozen-lockfile', '--strict-peer-dependencies'], {
        cwd: checkout,
        stdio: 'inherit',
      });
      // Execute the latest main's exporter and checks, not a stale webhook revision.
      execFileSync(
        process.execPath,
        ['--import', 'tsx', 'scripts/publishing/publish-snapshot.ts', '--worker'],
        { cwd: checkout, stdio: 'inherit' },
      );
      return;
    } catch (error) {
      if (
        !(error && typeof error === 'object' && 'status' in error && error.status === 75) ||
        attempt === 3
      )
        throw error;
      console.log('Main advanced; restarting export and validation against its latest tip.');
    } finally {
      // Only this disposable, automation-owned worktree is removed.
      git(root, 'worktree', 'remove', '--force', checkout);
      await rm(parent, { recursive: true, force: true });
    }
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await (process.argv.includes('--worker')
      ? publishAttempt(process.cwd())
      : publishSnapshot(process.cwd()));
  } catch (error) {
    if (error instanceof MainAdvanced) {
      console.error(error.message);
      process.exitCode = 75;
    } else throw error;
  }
}

import { afterEach, expect, it, vi } from 'vitest';
import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { publishAttempt } from '../../scripts/publishing/publish-snapshot';
import { writeSnapshot } from '../../scripts/publishing/snapshot';
import { storeAsset } from '../../scripts/publishing/media';
import { legacyProfile } from '../../scripts/migration/profile';
import { restoreDocuments } from '../../scripts/publishing/restore';
import { git } from '../../scripts/publishing/git';
import type { ExportSource, PublishedDocument } from '../../scripts/publishing/export-content';

const roots: string[] = [];
afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});
async function setup() {
  vi.stubEnv('GITHUB_ACTIONS', 'true');
  const root = await mkdtemp(path.join(tmpdir(), 'portfolio-publish-'));
  roots.push(root);
  const owner = path.join(root, 'owner'),
    remote = path.join(root, 'remote.git'),
    checkout = path.join(root, 'checkout');
  await mkdir(owner);
  await mkdir(remote);
  git(remote, 'init', '--bare', '-b', 'main');
  git(owner, 'init', '-b', 'main');
  git(owner, 'config', 'user.name', 'Test');
  git(owner, 'config', 'user.email', 'test@example.com');
  const bytes = Buffer.from('%PDF-1.7\nOriginal');
  const asset = await storeAsset(owner, 'file-resume', bytes, 'application/pdf');
  const initial = { posts: [], profile: legacyProfile(asset.sourceId), assets: [asset] };
  await writeSnapshot(owner, initial);
  await writeFile(path.join(owner, '.gitignore'), '.staging/\n');
  git(owner, 'add', '.');
  git(owner, 'commit', '-m', 'initial');
  git(owner, 'remote', 'add', 'origin', remote);
  git(owner, 'push', '-u', 'origin', 'main');
  git(root, 'clone', remote, checkout);
  git(checkout, 'config', 'user.name', 'Test');
  git(checkout, 'config', 'user.email', 'test@example.com');
  const docs: PublishedDocument[] = restoreDocuments(initial, { 'file-resume': 'file-resume' }).map(
    (doc) => ({
      ...doc,
      _rev: 'r1',
    }),
  );
  const source: ExportSource = {
    documents: async () => structuredClone(docs),
    assets: async () => [
      {
        _id: asset.sourceId,
        size: bytes.length,
        mimeType: asset.mimeType,
        url: 'https://cdn.sanity.io/files/test/production/resume.pdf',
      },
    ],
    bytes: async () => bytes,
  };
  return {
    root,
    owner,
    remote,
    checkout,
    source,
    docs,
    initialHead: git(remote, 'rev-parse', 'main'),
  };
}
it('publishes a validated complete snapshot to a real remote and skips a no-op', async () => {
  const { checkout, remote, source, docs, initialHead } = await setup();
  const verify = vi.fn();
  await publishAttempt(checkout, { source, verify });
  expect(verify).not.toHaveBeenCalled();
  expect(git(remote, 'rev-parse', 'main')).toBe(initialHead);
  docs[0].aside = 'A published revision';
  await publishAttempt(checkout, { source, verify });
  expect(verify).toHaveBeenCalledOnce();
  expect(git(remote, 'show', 'main:content/published/profile.json')).toContain(
    'A published revision',
  );
  expect(git(remote, 'rev-parse', 'main')).not.toBe(initialHead);
});
it('does not push when validation fails or main advances', async () => {
  const { root, checkout, owner, remote, source, docs, initialHead } = await setup();
  docs[0].aside = 'New published content';
  await expect(
    publishAttempt(checkout, {
      source,
      verify: () => {
        throw new Error('Build failed');
      },
    }),
  ).rejects.toThrow('Build failed');
  expect(git(remote, 'rev-parse', 'main')).toBe(initialHead);
  expect(git(checkout, 'rev-parse', 'HEAD')).toBe(initialHead);
  // A fresh disposable attempt, as used by the workflow's retry loop.
  const fresh = path.join(root, 'fresh');
  await cp(owner, fresh, { recursive: true });
  await expect(
    publishAttempt(fresh, {
      source,
      verify: () => {
        git(owner, 'commit', '--allow-empty', '-m', 'Concurrent code change');
        git(owner, 'push', 'origin', 'main');
      },
    }),
  ).rejects.toThrow(/advanced/);
  expect(git(remote, 'show', 'main:content/published/profile.json')).not.toContain(
    'New published content',
  );
});

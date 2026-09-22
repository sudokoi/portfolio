import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  exportContent,
  type ExportSource,
  type PublishedDocument,
} from '../../scripts/publishing/export-content';
import { readSnapshot } from '../../scripts/publishing/snapshot';
import { legacyProfile } from '../../scripts/migration/profile';

const dirs: string[] = [];
afterEach(async () => {
  await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});
const root = async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'portfolio-export-'));
  dirs.push(dir);
  return dir;
};
const pdf = Buffer.from('%PDF-1.7\nfixture');
function source(): ExportSource {
  const { id, resume, ...profile } = legacyProfile('file-resume');
  const documents: PublishedDocument[] = [
    { ...profile, _id: id, _type: 'profile', _rev: 'r1', resume: { _type: 'file', asset: resume } },
    {
      _id: 'post-test',
      _type: 'post',
      _rev: 'r2',
      slug: { current: 'test' },
      title: 'Test',
      description: 'Test post',
      publishedAt: '2024-05-07',
      tags: [],
      body: [
        {
          _type: 'block',
          _key: '1',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: 's', text: 'Hello', marks: [] }],
        },
      ],
    },
  ];
  return {
    documents: async () => structuredClone(documents),
    assets: async () => [
      {
        _id: 'file-resume',
        url: 'https://cdn.sanity.io/files/project/production/resume.pdf',
        mimeType: 'application/pdf',
        size: pdf.length,
      },
    ],
    bytes: async () => pdf,
  };
}
describe('complete published export', () => {
  it('is deterministic and recoverable without Sanity', async () => {
    const dir = await root();
    const a = await exportContent(dir, source());
    const b = await exportContent(dir, source());
    expect(a.digest).toBe(b.digest);
    const snapshot = await readSnapshot(a.stage);
    expect(snapshot.posts[0].slug).toBe('test');
    expect(await readFile(path.join(a.stage, 'public', snapshot.assets[0].path))).toEqual(pdf);
  });
  it('rejects missing, truncated or private data and cleans staging on failure', async () => {
    for (const variant of ['missing', 'truncated', 'draft', 'version'] as const) {
      const dir = await root();
      const fixture = source();
      if (variant === 'missing') fixture.assets = async () => [];
      if (variant === 'truncated') fixture.bytes = async () => pdf.subarray(0, 5);
      if (variant === 'draft' || variant === 'version') {
        const docs = await fixture.documents();
        docs[1]._id = variant === 'draft' ? 'drafts.post-test' : 'versions.release.post-test';
        fixture.documents = async () => docs;
      }
      await expect(exportContent(dir, fixture)).rejects.toThrow();
      expect(await readdir(path.join(dir, '.staging'))).toEqual([]);
    }
  });
  it('propagates unpublishing, but rejects accidental slug changes', async () => {
    const dir = await root();
    const initial = await exportContent(dir, source());
    const previous = await readSnapshot(initial.stage);
    const renamed = source();
    const docs = await renamed.documents();
    docs[1].slug = { current: 'renamed' };
    renamed.documents = async () => docs;
    await expect(exportContent(dir, renamed, previous)).rejects.toThrow(/slug changed/);
    const removed = source();
    removed.documents = async () => [docs[0]];
    expect(
      (await readSnapshot((await exportContent(dir, removed, previous)).stage)).posts,
    ).toHaveLength(0);
  });
});

import { expect, it } from 'vitest';
import { readSnapshot } from '../../scripts/publishing/snapshot';
import { restoreDocuments } from '../../scripts/publishing/restore';
import { assetReferences } from '../../src/modules/content/schema';
import {
  normalizeDocuments,
  type PublishedDocument,
} from '../../scripts/publishing/export-content';
it('round-trips structured content while remapping every original asset', async () => {
  const snapshot = await readSnapshot();
  const image = snapshot.assets.find((asset) => asset.mimeType.startsWith('image/'))!;
  snapshot.profile.photo = {
    _type: 'image',
    asset: { _type: 'reference', _ref: image.sourceId },
    alt: 'Portrait fixture',
  };
  snapshot.profile.projects.push({
    name: 'Unreleased project',
    description: 'An offline app',
    status: 'in-development',
    screenshot: snapshot.profile.photo,
  });
  const mapping = Object.fromEntries(
    snapshot.assets.map((asset, index) => [asset.sourceId, `restored-${index}`]),
  );
  const docs = restoreDocuments(snapshot, mapping);
  expect([...assetReferences(docs)].sort()).toEqual(Object.values(mapping).sort());
  const normalized = normalizeDocuments(
    docs.map((doc) => ({ ...doc, _rev: 'new' })) as PublishedDocument[],
  );
  expect(normalized.posts.map((post) => post.slug)).toEqual(
    snapshot.posts.map((post) => post.slug),
  );
  expect(normalized.profile.introduction).toEqual(snapshot.profile.introduction);
  expect(normalized.profile.photo?.asset._ref).toBe(mapping[image.sourceId]);
  expect(normalized.profile.projects.at(-1)?.screenshot?.asset._ref).toBe(mapping[image.sourceId]);
  expect(normalized.profile.projects.at(-1)?.href).toBeUndefined();
  expect(() => restoreDocuments(snapshot, {})).toThrow(/mapping/);
});

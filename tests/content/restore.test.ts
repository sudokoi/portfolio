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
  expect(() => restoreDocuments(snapshot, {})).toThrow(/mapping/);
});

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { readSnapshot } from './publishing/snapshot';
import { restoreDocuments } from './publishing/restore';
import { sanityClient } from './publishing/sanity';

const snapshot = await readSnapshot();
const apply = process.argv.includes('--apply');
if (!apply) {
  const documents = restoreDocuments(
    snapshot,
    Object.fromEntries(
      snapshot.assets.map((asset) => [asset.sourceId, `restored-${asset.sourceId}`]),
    ),
  );
  console.log(
    `Dry run: ${documents.length} documents and ${snapshot.assets.length} verified original assets. --apply requires a fresh target dataset and SANITY_WRITE_TOKEN.`,
  );
} else {
  const client = sanityClient(true);
  // Refuse even draft collisions; restoration is designed for a new dataset.
  const existing = await client
    .withConfig({ perspective: 'raw' })
    .fetch<number>('count(*[!(_type in ["sanity.imageAsset","sanity.fileAsset"])])');
  if (existing)
    throw new Error(
      'Restore requires a fresh dataset. Existing documents will not be overwritten.',
    );
  const mapping: Record<string, string> = {};
  for (const asset of snapshot.assets) {
    const uploaded = await client.assets.upload(
      asset.mimeType.startsWith('image/') ? 'image' : 'file',
      await readFile(path.join(process.cwd(), 'public', asset.path)),
      { filename: path.basename(asset.path), contentType: asset.mimeType },
    );
    mapping[asset.sourceId] = uploaded._id;
  }
  let transaction = client.transaction();
  for (const document of restoreDocuments(snapshot, mapping))
    transaction = transaction.create(document);
  await transaction.commit();
  console.log(
    `Restored ${snapshot.posts.length} posts and profile. Export the published state to record remapped Sanity asset IDs.`,
  );
}

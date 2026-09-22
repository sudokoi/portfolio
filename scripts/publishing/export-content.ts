import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import {
  assetReferences,
  postSchema,
  profileSchema,
  type Snapshot,
} from '../../src/modules/content/schema';
import { readSnapshot, writeSnapshot } from './snapshot';
import { storeAsset } from './media';
import { sanityClient } from './sanity';

export type PublishedDocument = Record<string, unknown> & {
  _id: string;
  _type: string;
  _rev: string;
};
export type SourceAsset = {
  _id: string;
  url: string;
  mimeType: string;
  size: number;
  sha1hash?: string;
};
export type ExportSource = {
  documents(): Promise<PublishedDocument[]>;
  assets(ids: string[]): Promise<SourceAsset[]>;
  bytes(asset: SourceAsset): Promise<Buffer>;
};

export function normalizeDocuments(documents: PublishedDocument[]) {
  if (documents.some((doc) => /^(drafts|versions)\./.test(doc._id)))
    throw new Error('Export attempted to include a draft/version');
  const profiles = documents.filter((doc) => doc._type === 'profile');
  if (profiles.length !== 1 || profiles[0]._id !== 'profile')
    throw new Error('Exactly one published profile singleton is required');
  if (documents.some((doc) => !['post', 'profile'].includes(doc._type)))
    throw new Error('Unexpected document type');
  const posts = documents
    .filter((doc) => doc._type === 'post')
    .map((doc) => {
      const slug = doc.slug as { current?: unknown } | undefined;
      return postSchema.parse({
        ...doc,
        id: doc._id,
        slug: slug?.current,
        updatedAt: doc.updatedAt ?? undefined,
      });
    });
  const profileDocument = profiles[0];
  const resume = profileDocument.resume as { asset?: unknown } | undefined;
  const profile = profileSchema.parse({
    ...profileDocument,
    id: profileDocument._id,
    resume: resume?.asset,
  });
  return { posts, profile };
}

/** Builds a complete temporary tree. The caller owns cleanup and publication. */
export async function exportContent(root: string, source: ExportSource, previous?: Snapshot) {
  await mkdir(path.join(root, '.staging'), { recursive: true });
  const stage = await mkdtemp(path.join(root, '.staging/export-'));
  try {
    const documents = await source.documents();
    const content = normalizeDocuments(documents);
    for (const post of content.posts) {
      const old = previous?.posts.find((item) => item.id === post.id);
      if (old && old.slug !== post.slug)
        throw new Error(
          `Published slug changed: ${old.slug} → ${post.slug}. Add an explicit redirect migration first.`,
        );
    }
    const ids = [...assetReferences(content)].sort();
    const assets = await source.assets(ids);
    if (
      assets.length !== ids.length ||
      new Set(assets.map((asset) => asset._id)).size !== ids.length ||
      assets.some((asset) => !ids.includes(asset._id))
    )
      throw new Error('Missing or duplicate source asset');
    const records = [];
    for (const asset of assets) {
      const bytes = await source.bytes(asset);
      if (bytes.length !== asset.size) throw new Error(`Incomplete asset: ${asset._id}`);
      if (asset.sha1hash && createHash('sha1').update(bytes).digest('hex') !== asset.sha1hash)
        throw new Error(`Source checksum mismatch: ${asset._id}`);
      records.push(await storeAsset(stage, asset._id, bytes, asset.mimeType));
    }
    const manifest = await writeSnapshot(
      stage,
      { ...content, assets: records },
      Object.fromEntries(documents.map((doc) => [doc._id, doc._rev])),
    );
    await readSnapshot(stage);
    return { stage, digest: manifest.digest };
  } catch (error) {
    await rm(stage, { recursive: true, force: true });
    throw error;
  }
}

export function liveSource(): ExportSource {
  const client = sanityClient();
  const { projectId, dataset } = client.config();
  return {
    documents: () =>
      client.fetch<PublishedDocument[]>(
        `*[_type in ["post", "profile"] && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]{_id,_type,_rev,title,slug,description,publishedAt,updatedAt,tags,body,name,role,introduction,aside,experience,projects,skills,links,resume}`,
      ),
    assets: (ids) =>
      client.fetch<SourceAsset[]>(
        `*[_id in $ids && _type in ["sanity.imageAsset","sanity.fileAsset"]]{_id,url,mimeType,size,sha1hash}`,
        { ids },
      ),
    bytes: async (asset) => {
      const url = new URL(asset.url);
      if (
        url.origin !== 'https://cdn.sanity.io' ||
        ![`/images/${projectId}/${dataset}/`, `/files/${projectId}/${dataset}/`].some((prefix) =>
          url.pathname.startsWith(prefix),
        ) ||
        url.search ||
        url.hash ||
        asset.size > 50 * 1024 * 1024
      )
        throw new Error('Unexpected asset origin or size');
      const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(60_000) });
      if (!response.ok || !response.body)
        throw new Error(`Asset request failed: ${response.status}`);
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > asset.size || size > 50 * 1024 * 1024)
            throw new Error('Asset exceeded declared size');
          chunks.push(value);
        }
      } finally {
        await reader.cancel();
      }
      return Buffer.concat(chunks);
    },
  };
}

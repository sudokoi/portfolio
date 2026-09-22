import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { validateSnapshot, type Snapshot } from '../../src/modules/content/schema';

export const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
export function stableJson(value: unknown): string {
  function sort(node: unknown): unknown {
    if (Array.isArray(node)) return node.map(sort);
    if (node && typeof node === 'object')
      return Object.fromEntries(
        Object.entries(node)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => [key, sort(item)]),
      );
    return node;
  }
  return JSON.stringify(sort(value), null, 2) + '\n';
}
export const manifestSchema = z.object({
  schemaVersion: z.literal(1),
  digest: z.string().regex(/^[a-f0-9]{64}$/),
  posts: z.array(z.string().regex(/^posts\/[a-z0-9-]+\.json$/)),
  profile: z.literal('profile.json'),
  revisions: z.record(z.string(), z.string()),
});
export async function readSnapshot(root = process.cwd()): Promise<Snapshot> {
  const directory = path.join(root, 'content/published');
  const json = async (file: string) =>
    JSON.parse(await readFile(path.join(directory, file), 'utf8'));
  const manifest = manifestSchema.parse(await json('manifest.json'));
  if (new Set(manifest.posts).size !== manifest.posts.length)
    throw new Error('Duplicate manifest file');
  const data = validateSnapshot({
    posts: await Promise.all(manifest.posts.map(json)),
    profile: await json(manifest.profile),
    assets: await json('assets.json'),
  });
  if (hash(stableJson(data)) !== manifest.digest) throw new Error('Snapshot digest mismatch');
  const expectedPosts = manifest.posts.map((file) => path.basename(file)).sort();
  const actualPosts = (
    await readdir(path.join(directory, 'posts')).catch((error: NodeJS.ErrnoException) => {
      // Git does not preserve an empty directory after all posts are unpublished.
      if (error.code === 'ENOENT' && expectedPosts.length === 0) return [];
      throw error;
    })
  ).sort();
  if (stableJson(expectedPosts) !== stableJson(actualPosts))
    throw new Error('Unexpected snapshot document');
  for (const asset of data.assets) {
    const bytes = await readFile(path.join(root, 'public', asset.path));
    if (bytes.length !== asset.bytes || hash(bytes) !== asset.sha256)
      throw new Error(`Asset integrity failure: ${asset.sourceId}`);
  }
  return data;
}
export async function writeSnapshot(
  root: string,
  input: Snapshot,
  revisions: Record<string, string> = {},
) {
  const data = validateSnapshot(input);
  data.posts.sort((a, b) => a.slug.localeCompare(b.slug));
  data.assets.sort((a, b) => a.sourceId.localeCompare(b.sourceId));
  const directory = path.join(root, 'content/published');
  await mkdir(path.join(directory, 'posts'), { recursive: true });
  for (const post of data.posts)
    await writeFile(path.join(directory, `posts/${post.slug}.json`), stableJson(post));
  await writeFile(path.join(directory, 'profile.json'), stableJson(data.profile));
  await writeFile(path.join(directory, 'assets.json'), stableJson(data.assets));
  const manifest = {
    schemaVersion: 1,
    digest: hash(stableJson(data)),
    posts: data.posts.map((post) => `posts/${post.slug}.json`),
    profile: 'profile.json',
    revisions,
  };
  await writeFile(path.join(directory, 'manifest.json'), stableJson(manifest));
  return manifest;
}

import 'server-only';
import generated from './generated';
import { validateSnapshot } from './schema';

const snapshot = validateSnapshot(generated);
const posts = snapshot.posts.toSorted(
  (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug),
);
export const listPosts = () => posts;
export const getPost = (slug: string) => posts.find((post) => post.slug === slug);
export const getProfile = () => snapshot.profile;
export function getAsset(id: string) {
  const asset = snapshot.assets.find((item) => item.sourceId === id);
  if (!asset) throw new Error(`Unknown published asset: ${id}`);
  return asset;
}

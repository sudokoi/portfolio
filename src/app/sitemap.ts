import type { MetadataRoute } from 'next';
import { listPosts } from '@/modules/content';
import { canonical } from '@/shared/config/site';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...['/', '/projects', '/blogs', '/agents'].map((path) => ({ url: canonical(path) })),
    ...listPosts().map((post) => ({
      url: canonical(`/blog/${post.slug}`),
      lastModified: post.updatedAt ?? post.publishedAt,
    })),
  ];
}

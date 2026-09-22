import type { Metadata } from 'next';
import type { PublishedPost } from '@/modules/content';
import { canonical, SITE_TITLE } from '@/shared/config/site';
export function pageMetadata(title: string, description: string, path: string): Metadata {
  const image = canonical(
    path.startsWith('/blog/') ? `${path}/opengraph-image` : '/opengraph-image',
  );
  return {
    title,
    description,
    alternates: { canonical: canonical(path) },
    openGraph: {
      title,
      description,
      url: canonical(path),
      siteName: SITE_TITLE,
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@sudokaii',
    },
  };
}
export function postMetadata(post: PublishedPost): Metadata {
  const metadata = pageMetadata(post.title, post.description, `/blog/${post.slug}`);
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: post.publishedAt,
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      tags: post.tags,
      authors: [canonical()],
    },
  };
}

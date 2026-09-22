import { notFound } from 'next/navigation';
import { getPost, listPosts } from '@/modules/content';
import { socialImage } from '@/modules/seo';
export const alt = 'Article from Sudhanshu’s Corner';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';
export const dynamicParams = false;
export const generateStaticParams = () => listPosts().map((post) => ({ slug: post.slug }));
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return socialImage(post.title, post.description);
}

import { notFound } from 'next/navigation';
import { getPost, listPosts } from '@/modules/content';
import { ArticlePage } from '@/modules/blog';
import { postMetadata } from '@/modules/seo';
export const dynamicParams = false;
export const generateStaticParams = () => listPosts().map((post) => ({ slug: post.slug }));
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return postMetadata(post);
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return <ArticlePage post={post} />;
}

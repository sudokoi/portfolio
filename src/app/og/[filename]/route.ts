import { getPost } from '@/modules/content';
import { canonical } from '@/shared/config/site';
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (filename === 'index-og-image.jpeg')
    return Response.redirect(canonical('/opengraph-image'), 308);
  const slug = filename.endsWith('.jpeg') ? filename.slice(0, -5) : '';
  return getPost(slug)
    ? Response.redirect(canonical(`/blog/${slug}/opengraph-image`), 308)
    : new Response('Not found', { status: 404 });
}

import { listPosts } from '@/modules/content';
import { canonical, SITE_TITLE } from '@/shared/config/site';
const xml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!,
  );
export const dynamic = 'force-static';
export function GET() {
  const items = listPosts()
    .map(
      (post) =>
        `<item><title>${xml(post.title)}</title><link>${canonical(`/blog/${post.slug}`)}</link><guid isPermaLink="true">${canonical(`/blog/${post.slug}`)}</guid><description>${xml(post.description)}</description><pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>${post.tags.map((tag) => `<category>${xml(tag)}</category>`).join('')}</item>`,
    )
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(SITE_TITLE)}</title><link>${canonical()}</link><description>A frontend developer’s personal journal.</description><language>en</language><atom:link href="${canonical('/feed.xml')}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`,
    { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } },
  );
}

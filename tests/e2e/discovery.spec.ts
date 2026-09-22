import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { readSnapshot } from '../../scripts/publishing/snapshot';
const { posts } = await readSnapshot();
test('each article has matching canonical metadata, structured data and a real social card', async ({
  page,
  request,
}) => {
  for (const post of posts) {
    await page.goto(`/blog/${post.slug}`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://sudh.online/blog/${post.slug}`,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', post.title);
    const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
    expect(schema['@graph'][0].datePublished).toBe(post.publishedAt);
    const image = await request.get(`/blog/${post.slug}/opengraph-image`);
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toContain('image/png');
    const info = await sharp(await image.body()).metadata();
    expect([info.width, info.height]).toEqual([1200, 630]);
    const legacy = await request.get(`/og/${post.slug}.jpeg`, { maxRedirects: 0 });
    expect(legacy.status()).toBe(308);
    expect(legacy.headers().location).toBe(`https://sudh.online/blog/${post.slug}/opengraph-image`);
  }
});
test('feeds, route compatibility, previews and not-found statuses', async ({ page, request }) => {
  const feed = await request.get('/feed.xml');
  expect(feed.status()).toBe(200);
  const sitemap = await request.get('/sitemap.xml');
  for (const post of posts) {
    expect(await feed.text()).toContain(`/blog/${post.slug}`);
    expect(await sitemap.text()).toContain(`/blog/${post.slug}`);
  }
  const redirect = await request.get('/blog?from=old', { maxRedirects: 0 });
  expect(redirect.status()).toBe(308);
  expect(redirect.headers().location).toBe('/blogs?from=old');
  expect((await request.get('/blog/does-not-exist')).status()).toBe(404);
  expect((await request.get('/blog/does-not-exist/opengraph-image')).status()).toBe(404);
  expect((await request.get('/og/does-not-exist.jpeg')).status()).toBe(404);
  await page.goto('/');
  if (process.env.SITE_INDEXABLE !== 'true')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

import { test, expect } from '@playwright/test';
import { readSnapshot } from '../../scripts/publishing/snapshot';
const snapshot = await readSnapshot();

test('core content and navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: '/blogs', exact: true }).click();
  for (const post of snapshot.posts)
    await expect(page.getByRole('link', { name: post.title, exact: true })).toBeVisible();
  for (const post of snapshot.posts) {
    expect((await page.goto(`/blog/${post.slug}`))?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: post.title, level: 1 })).toBeVisible();
    expect(await page.locator('pre code').count()).toBe(
      post.body.filter((block) => block._type === 'code').length,
    );
    expect(await page.getByRole('img', { name: /Live halo demonstration/ }).count()).toBe(
      post.body.filter((block) => block._type === 'demo').length,
    );
  }
  await context.close();
});
test('resume serves the current verified PDF with a stable filename', async ({ request }) => {
  const response = await request.get('/resume');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-disposition']).toContain('Sudhanshu-Ranjan-Resume.pdf');
  const asset = snapshot.assets.find((asset) => asset.sourceId === snapshot.profile.resume._ref)!;
  expect(response.headers().etag).toBe(`"${asset.sha256}"`);
  expect((await response.body()).byteLength).toBe(asset.bytes);
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
});
test('search loads its index only on demand and has an empty result state', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/blogs');
  expect(requests.some((url) => url.includes('search-index.json'))).toBe(false);
  if (snapshot.posts.length) {
    await page.getByLabel('Search the journal').fill(snapshot.posts[0].title.split(' ')[0]);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(page.getByRole('list', { name: 'Search results' })).toBeVisible();
  }
  await page.getByLabel('Search the journal').fill('nomatchingword12345');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('No posts found');
});

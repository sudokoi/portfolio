import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readSnapshot } from '../../scripts/publishing/snapshot';
const { posts } = await readSnapshot();
for (const width of [320, 390, 768, 1440])
  test(`readable layouts at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/',
      '/projects',
      '/blogs',
      ...posts.map((post) => `/blog/${post.slug}`),
      '/agents',
    ]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        results.violations,
        `${path}: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`,
      ).toEqual([]);
    }
  });
test('keyboard entry and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const demoPost = posts.find((post) => post.body.some((block) => block._type === 'demo'));
  await page.goto(demoPost ? `/blog/${demoPost.slug}` : '/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  if (demoPost)
    expect(
      await page
        .getByRole('img', { name: /Live halo demonstration:/ })
        .first()
        .evaluate((element) =>
          [...element.children].every((child) => getComputedStyle(child).animationName === 'none'),
        ),
    ).toBe(true);
});

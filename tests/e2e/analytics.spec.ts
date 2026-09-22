import { test, expect } from '@playwright/test';
test('analytics links have meaningful events and work when tracking is blocked', async ({
  page,
}) => {
  await page.route('**/*umami*', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('[data-umami-event="resume_link_click"]').first()).toHaveAttribute(
    'href',
    '/resume',
  );
  expect(await page.locator('[data-umami-event="project_link_click"]').count()).toBeGreaterThan(0);
  expect(await page.locator('[data-umami-event="contact_link_click"]').count()).toBeGreaterThan(0);
  expect(await page.locator('script[data-website-id]').count()).toBe(
    process.env.VERCEL_ENV === 'production' && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ? 1 : 0,
  );
  await page.getByRole('link', { name: '/blogs', exact: true }).click();
  await expect(page).toHaveURL('/blogs');
});

import { expect, test } from '@playwright/test';
import { readSnapshot } from '../../scripts/publishing/snapshot';

const { profile } = await readSnapshot();
test('project showcase uses published content and works without JavaScript', async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: '/projects', exact: true })
      .click();
    await expect(page).toHaveURL('/projects');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://sudh.online/projects',
    );
    for (const project of profile.projects) {
      const section = page
        .getByRole('article')
        .filter({ has: page.getByRole('heading', { name: project.name, exact: true }) });
      await expect(section).toContainText(project.description);
      if (project.href)
        await expect(section.getByRole('link', { name: /View source/ })).toHaveAttribute(
          'href',
          project.href,
        );
      else await expect(section.getByRole('link', { name: /View source/ })).toHaveCount(0);
      if (project.playStoreUrl)
        await expect(section.getByRole('link', { name: /Get it on Google Play/ })).toHaveAttribute(
          'href',
          project.playStoreUrl,
        );
      if (project.screenshot)
        await expect(
          section.getByRole('img', { name: project.screenshot.alt, exact: true }),
        ).toBeVisible();
    }
    expect(await (await request.get('/sitemap.xml')).text()).toContain(
      'https://sudh.online/projects',
    );
  } finally {
    await context.close();
  }
});

import { expect, test } from '@playwright/test';

test('Sentry captures browser errors through an intercepted envelope', async ({ page }) => {
  test.skip(
    process.env.VERCEL_ENV !== 'production' ||
      process.env.NEXT_PUBLIC_SENTRY_DSN !== 'https://public@example.invalid/1',
    'Run against the documented production-mode build with the dummy DSN.',
  );

  const envelopes: string[] = [];
  await page.route('https://example.invalid/**', async (route) => {
    envelopes.push(route.request().postData() ?? '');
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/');
  await page.evaluate(() => {
    // A page script exercises the SDK's global error handler, not a mocked capture call.
    const script = document.createElement('script');
    script.textContent =
      'setTimeout(() => { throw new Error("Portfolio Sentry smoke test"); }, 0);';
    document.body.append(script);
  });
  await expect.poll(() => envelopes.join('\n')).toContain('Portfolio Sentry smoke test');
  const event = envelopes
    .flatMap((envelope) => envelope.split('\n'))
    .map((line) => JSON.parse(line))
    .find((item) => item.exception);
  expect(event.environment).toBe('production');
  expect(event.exception.values[0].type).toBe('Error');
  expect(event.exception.values[0].stacktrace.frames.length).toBeGreaterThan(0);
  expect(event.user).toBeUndefined();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

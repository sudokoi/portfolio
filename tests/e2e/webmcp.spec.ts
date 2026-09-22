import { test, expect } from '@playwright/test';
import { readSnapshot } from '../../scripts/publishing/snapshot';
const post = (await readSnapshot()).posts[0];
test('WebMCP stays optional, registers lazily, and restricts navigation', async ({ page }) => {
  await page.addInitScript(() => {
    type Tool = { name: string; execute: (args: Record<string, unknown>) => Promise<string> };
    const tools: Record<string, Tool> = {};
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool: async (tool: Tool, options: { signal: AbortSignal }) => {
          tools[tool.name] = tool;
          options.signal.addEventListener('abort', () => delete tools[tool.name]);
        },
      },
    });
    Object.assign(window, { testTools: tools });
  });
  let indexRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('search-index.json')) indexRequests++;
  });
  await page.goto('/');
  await expect
    .poll(() =>
      page.evaluate(
        () => Object.keys((window as unknown as { testTools: object }).testTools).length,
      ),
    )
    .toBe(2);
  expect(indexRequests).toBe(0);
  const result = await page.evaluate(async (query) => {
    const tools = (
      window as unknown as {
        testTools: Record<string, { execute: (input: Record<string, unknown>) => Promise<string> }>;
      }
    ).testTools;
    return tools.search_posts.execute({ query });
  }, post?.title ?? 'unpublished');
  if (post) expect(result).toContain(post.slug);
  else expect(result).toBe('[]');
  const error = await page.evaluate(async () => {
    const tools = (
      window as unknown as {
        testTools: Record<string, { execute: (input: Record<string, unknown>) => Promise<string> }>;
      }
    ).testTools;
    try {
      await tools.open_article.execute({ slug: 'https://evil.example' });
      return null;
    } catch (error) {
      return String(error);
    }
  });
  expect(error).toContain('Invalid article slug');
  if (post) {
    await page.evaluate(async (slug) => {
      await (
        window as unknown as {
          testTools: Record<
            string,
            { execute: (input: Record<string, unknown>) => Promise<string> }
          >;
        }
      ).testTools.open_article.execute({ slug });
    }, post.slug);
    await expect(page).toHaveURL(`/blog/${post.slug}`);
  }
  await expect
    .poll(() =>
      page.evaluate(
        () => Object.keys((window as unknown as { testTools: object }).testTools).length,
      ),
    )
    .toBe(2);
});

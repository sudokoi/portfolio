import { test, expect } from '@playwright/test';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { readSnapshot } from '../../scripts/publishing/snapshot';
test('real MCP SDK lists and calls public read-only tools', async () => {
  const client = new Client({ name: 'portfolio-verification', version: '1.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL('http://localhost:3000/mcp')));
  try {
    const listed = await client.listTools();
    expect(listed.tools.map((tool) => tool.name).sort()).toEqual([
      'fetch',
      'get_profile',
      'get_resume',
      'search',
    ]);
    expect(listed.tools.every((tool) => tool.annotations?.readOnlyHint)).toBe(true);
    const { posts, profile } = await readSnapshot();
    if (posts.length) {
      const found = await client.callTool({ name: 'search', arguments: { query: posts[0].title } });
      expect(JSON.stringify(found)).toContain(posts[0].id);
      const article = await client.callTool({ name: 'fetch', arguments: { id: posts[0].id } });
      expect(JSON.stringify(article)).toContain(`https://sudh.online/blog/${posts[0].slug}`);
    }
    expect(JSON.stringify(await client.callTool({ name: 'get_profile', arguments: {} }))).toContain(
      profile.name,
    );
    expect(JSON.stringify(await client.callTool({ name: 'get_resume', arguments: {} }))).toContain(
      'https://sudh.online/resume',
    );
    expect(
      (await client.callTool({ name: 'fetch', arguments: { id: 'drafts.secret' } })).isError,
    ).toBe(true);
    expect(
      (await client.callTool({ name: 'search', arguments: { query: 'x'.repeat(201) } })).isError,
    ).toBe(true);
  } finally {
    await client.close();
  }
});
test('MCP transport rejects unapproved browser origins', async ({ request }) => {
  expect(
    (
      await request.post('/mcp', { headers: { Origin: 'https://unrelated.example' }, data: {} })
    ).status(),
  ).toBe(403);
});

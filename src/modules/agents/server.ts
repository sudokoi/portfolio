import 'server-only';
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { listPosts, getProfile, getAsset, articleText } from '@/modules/content';
import { searchPosts } from '@/shared/search';
import { canonical, SITE_ORIGIN } from '@/shared/config/site';

const annotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};
const result = (value: Record<string, unknown>) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value) }],
  structuredContent: value,
});
const posts = listPosts();
const searchDocuments = posts.map((post) => ({
  ...post,
  text: articleText(post.body),
  url: canonical(`/blog/${post.slug}`),
}));
const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'get_profile',
      {
        description:
          'Read Sudhanshu Ranjan’s public profile, experience, skills, projects, and contact links.',
        inputSchema: z.object({}),
        annotations,
      },
      async () => {
        const { name, role, introduction, aside, experience, projects, skills, links } =
          getProfile();
        return result({
          name,
          role,
          introduction,
          aside,
          experience,
          projects,
          skills,
          links,
          url: canonical(),
        });
      },
    );
    server.registerTool(
      'search',
      {
        description:
          'Search published articles by topic. Returns article IDs, titles, excerpts, and canonical URLs.',
        inputSchema: z.object({
          query: z.string().max(200),
          limit: z.number().int().min(1).max(20).optional(),
        }),
        annotations,
      },
      async ({ query, limit }) => result({ results: searchPosts(searchDocuments, query, limit) }),
    );
    server.registerTool(
      'fetch',
      {
        description:
          'Read a published article using an ID returned by search. Includes full article text, metadata, and canonical URL.',
        inputSchema: z.object({ id: z.string().max(200) }),
        annotations,
      },
      async ({ id }) => {
        const post = posts.find((post) => post.id === id);
        if (!post)
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: 'Article not found. Use search to find a published article ID.',
              },
            ],
          };
        return result({
          id: post.id,
          title: post.title,
          description: post.description,
          publishedAt: post.publishedAt,
          ...(post.updatedAt ? { updatedAt: post.updatedAt } : {}),
          tags: post.tags,
          text: articleText(post.body),
          url: canonical(`/blog/${post.slug}`),
        });
      },
    );
    server.registerTool(
      'get_resume',
      {
        description: 'Get the current public resume PDF download URL and metadata.',
        inputSchema: z.object({}),
        annotations,
      },
      async () => {
        const asset = getAsset(getProfile().resume._ref);
        return result({
          url: canonical('/resume'),
          mimeType: asset.mimeType,
          bytes: asset.bytes,
          sha256: asset.sha256,
        });
      },
    );
  },
  { serverInfo: { name: 'sudh-online', version: '1.0.0' }, maxSubscriptions: 0 },
);

export async function mcpRequest(request: Request) {
  const origin = request.headers.get('origin');
  const allowed = new Set([
    SITE_ORIGIN,
    ...(process.env.VERCEL_URL
      ? [`https://${process.env.VERCEL_URL}`]
      : ['http://localhost:3000', 'http://127.0.0.1:3000']),
  ]);
  if (origin && !allowed.has(origin)) return new Response('Origin not allowed', { status: 403 });
  if (request.method === 'OPTIONS')
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || SITE_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, MCP-Protocol-Version, MCP-Session-Id',
        Vary: 'Origin',
      },
    });
  if (Number(request.headers.get('content-length') || 0) > 65_536)
    return new Response('Request too large', { status: 413 });
  const response = await handler(request);
  response.headers.set('Cache-Control', 'no-store');
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
  }
  return response;
}

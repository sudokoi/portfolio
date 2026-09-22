'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadSearchIndex } from '@/shared/search/client';
import { searchPosts } from '@/shared/search';

type BrowserTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean };
  execute: (input: Record<string, unknown>) => Promise<string>;
};
type ModelContext = {
  registerTool: (tool: BrowserTool, options: { signal: AbortSignal }) => Promise<void>;
};
export function WebMcpBridge() {
  const router = useRouter();
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const controller = new AbortController();
    const tools: BrowserTool[] = [
      {
        name: 'search_posts',
        description: 'Search published frontend engineering articles by topic.',
        inputSchema: {
          type: 'object',
          properties: { query: { type: 'string', maxLength: 200 } },
          required: ['query'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: async ({ query }) => {
          if (typeof query !== 'string' || query.length > 200)
            throw new Error('Expected a query up to 200 characters');
          return JSON.stringify(searchPosts(await loadSearchIndex(), query));
        },
      },
      {
        name: 'open_article',
        description: 'Navigate to a published article using its slug from search_posts.',
        inputSchema: {
          type: 'object',
          properties: { slug: { type: 'string', maxLength: 150 } },
          required: ['slug'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: async ({ slug }) => {
          if (typeof slug !== 'string' || !/^[a-z0-9-]{1,150}$/.test(slug))
            throw new Error('Invalid article slug');
          const post = (await loadSearchIndex()).find((post) => post.slug === slug);
          if (!post) throw new Error('Article not found');
          router.push(`/blog/${post.slug}`);
          return `Opened ${post.title}`;
        },
      },
    ];
    void (async () => {
      try {
        for (const tool of tools) {
          if (controller.signal.aborted) return;
          await context.registerTool(tool, { signal: controller.signal });
        }
      } catch {
        controller.abort(); /* Experimental registration must never break ordinary browsing. */
      }
    })();
    return () => controller.abort();
  }, [router]);
  return null;
}

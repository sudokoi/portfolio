import { pageMetadata } from '@/modules/seo';
export const metadata = pageMetadata(
  'Agent access',
  'Read this portfolio and journal through its public, read-only MCP endpoint.',
  '/agents',
);
export default function AgentsPage() {
  return (
    <div className="prose-page">
      <h1>A corner for agents, too.</h1>
      <p>
        This site has a public, read-only MCP endpoint. Connect it to a compatible MCP client using
        Streamable HTTP:
      </p>
      <p>
        <code>https://sudh.online/mcp</code>
      </p>
      <p>No account, API key, or model service is required to read the site.</p>
      <h2>Available tools</h2>
      <ul>
        <li>
          <code>get_profile</code> — introduction, experience, skills, projects, and public links.
        </li>
        <li>
          <code>search</code> — find posts by topic; returns IDs and canonical URLs.
        </li>
        <li>
          <code>fetch</code> — read a full article using an ID returned by search.
        </li>
        <li>
          <code>get_resume</code> — get the current resume PDF link.
        </li>
      </ul>
      <h2>The same published content</h2>
      <p>
        Tools read the same versioned snapshot as the pages here. There are no drafts, private
        documents, or write operations.
      </p>
      <h2>In your browser</h2>
      <p>
        Browsers with WebMCP enabled can also use <code>search_posts</code> and{' '}
        <code>open_article</code>. WebMCP is experimental; ordinary browsing works without it.
      </p>
      <p>
        Prefer a feed? <a href="/feed.xml">Subscribe via RSS</a>.
      </p>
    </div>
  );
}

import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

const WEBSITE_URL = "https://sudh.online";

export const loader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}` || WEBSITE_URL;

  const body = `User-agent: *
Allow: /
Disallow: /tunnel
Disallow: /resume
Disallow: /og/
Sitemap: ${baseUrl}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

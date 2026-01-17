import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { parse } from "date-fns/parse";

const WEBSITE_URL = "https://sudh.online";

const formatLastMod = (date: Date) => date.toISOString().split("T")[0];

const getBlogRoutes = () => {
  return Object.entries(
    import.meta.glob("./**/*.mdx", {
      import: "frontmatter",
      eager: true,
    }),
  ).map(([filePath, contents]) => {
    const path = filePath
      .replace("./", "/")
      .replace(".", "/")
      .replace(/\.mdx$/, "");

    const frontmatter = contents as { date?: string };
    const parsedDate = frontmatter.date
      ? parse(frontmatter.date, "MMM dd, yyyy", new Date())
      : new Date();

    return { path, lastmod: formatLastMod(parsedDate) };
  });
};

const getStaticRoutes = () => {
  const entries = Object.entries(
    import.meta.glob("./(_index|blogs).{tsx,ts}", {
      import: "lastmod",
      eager: true,
    }),
  );

  return entries.map(([filePath, lastmod]) => {
    let path = filePath.replace("./", "/").replace(/\.(tsx|ts)$/, "");
    if (path === "/_index") {
      path = "/";
    }

    return {
      path,
      lastmod:
        typeof lastmod === "string" ? lastmod : formatLastMod(new Date()),
    };
  });
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}` || WEBSITE_URL;

  const staticRoutes = getStaticRoutes();
  const blogRoutes = getBlogRoutes();

  const urls = [...staticRoutes, ...blogRoutes]
    .map(({ path, lastmod }) => ({ loc: `${baseUrl}${path}`, lastmod }))
    .map(
      ({ loc, lastmod }) =>
        `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

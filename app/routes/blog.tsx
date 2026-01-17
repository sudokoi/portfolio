import {
  Link,
  Outlet,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import Giscus from "@giscus/react";
import {
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from "@remix-run/cloudflare";
import { ShareOnTwitter } from "~/components/share-twitter";
import { TWITTER_HANDLE } from "~/utils/contants";
import { parse } from "date-fns/parse";
import { NotFoundPage } from "~/components/not-found";

type BlogMeta = { title: string; description: string; date: string };

const getBlogEntries = () => {
  return Object.entries(
    import.meta.glob("./blog.*.mdx", {
      import: "frontmatter",
      eager: true,
    }),
  )
    .map(([filePath, contents]) => {
      const path = filePath
        .replace("./", "/")
        .replace(".", "/")
        .replace(/\.mdx$/, "");

      return {
        path,
        ...(contents as BlogMeta),
      };
    })
    .sort((a, b) => {
      try {
        const aDate = parse(a.date, "MMM dd, yyyy", new Date());
        const bDate = parse(b.date, "MMM dd, yyyy", new Date());
        return aDate.getTime() - bDate.getTime();
      } catch (e) {
        return 0;
      }
    });
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  // check if the request has subpath
  // since the /blog route is a layout route, this should never be rendered
  // and users should be redirected to the /blogs route instead if they try to access it

  // check if it ends with /blog or /blog/
  if (request.url.endsWith("/blog") || request.url.endsWith("/blog/")) {
    return redirect("/blogs");
  }

  const pathname = new URL(request.url).pathname;
  const entries = getBlogEntries();
  const currentIndex = entries.findIndex((entry) => entry.path === pathname);
  const previous = currentIndex > 0 ? entries[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < entries.length - 1
      ? entries[currentIndex + 1]
      : null;

  return json({ pageUrl: request.url, previous, next });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Sudhanshu's Corner" },
    {
      name: "description",
      content: "Sudhanshu's corner of the internet.",
    },
    { name: "twitter:site", content: TWITTER_HANDLE },
    { name: "twitter:creator", content: TWITTER_HANDLE },
    { property: "og:site_name", content: "Sudhanshu's Corner" },
    { property: "og:locale", content: "en_US" },
    {
      property: "og:image",
      content: "/og/index-og-image.jpeg",
    },
  ];
};

export default function Blog() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div className="flex h-full w-full flex-col">
      <div className="prose max-w-full flex-1 [&_a]:text-accent [&_a]:underline-offset-4 focus:[&_a]:rounded focus:[&_a]:outline-none focus:[&_a]:ring-[1px] focus:[&_a]:ring-accent focus:[&_a]:ring-offset-2">
        <Outlet />
      </div>
      <hr className="my-4 inline-block" />
      {(loaderData.previous || loaderData.next) && (
        <nav className="my-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {loaderData.previous ? (
            <Link
              to={loaderData.previous.path}
              reloadDocument
              className="text-accent underline underline-offset-4 focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
            >
              ← Previous: {loaderData.previous.title}
            </Link>
          ) : (
            <span />
          )}
          {loaderData.next ? (
            <Link
              to={loaderData.next.path}
              reloadDocument
              className="text-accent underline underline-offset-4 focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
            >
              Next: {loaderData.next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
      <div className="py-4">
        <aside className="border border-l-0 border-r-0 border-dotted border-b-accent border-t-accent p-4">
          If you like what you read, consider{" "}
          <a
            href={`https://twitter.com/${TWITTER_HANDLE}`}
            target="_blank"
            rel="me noreferrer"
            className="text-accent underline underline-offset-4 focus:rounded focus:no-underline focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
          >
            following
          </a>{" "}
          me on Twitter, or{" "}
          <ShareOnTwitter pageUrl={loaderData.pageUrl}>sharing</ShareOnTwitter>{" "}
          this article.
        </aside>
      </div>
      <div className="h-full w-full text-primary">
        <Giscus
          repo="tometo-dev/sudhanshu-on-the-internet"
          repoId="R_kgDOL28q5Q"
          category="comments"
          categoryId="DIC_kwDOL28q5c4CfNa2"
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="0"
          inputPosition="top"
          theme="dark_dimmed"
        />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center py-16 text-primary">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
    </div>
  );
}

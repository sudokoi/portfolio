import { captureRemixErrorBoundaryError, withSentry } from "@sentry/remix";
import { LinksFunction } from "@remix-run/cloudflare";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteError,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css?url";
import { Nav } from "./components/nav";
import { Footer } from "./components/footer";

const WEBSITE_URL = "https://sudh.online";

export const links: LinksFunction = () => [
  { rel: "preload", href: stylesheet, as: "style" },
  { rel: "stylesheet", href: stylesheet },
  { rel: "sitemap", href: "/sitemap.xml", type: "application/xml" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const canonicalUrl = `${WEBSITE_URL}${location.pathname}`;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index,follow" />
        <link rel="canonical" href={canonicalUrl} />
        <Meta />
        <style>{"body{background:#F3F2F8;color:#363681;}"}</style>
        <Links />
      </head>
      <body className="bg-tertiary">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  return (
    <div className="m-0 h-svh w-svw p-0 font-mono text-primary">
      <div className="relative mx-auto flex h-full w-full flex-col">
        <Nav />
        <main className="mx-auto h-full w-full flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-16">
            <Outlet />
          </div>
        </main>
        <Footer className="sm:px mx-auto flex w-full max-w-7xl px-6 py-2" />
      </div>
    </div>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError();
  captureRemixErrorBoundaryError(error);
  return <div>Something went wrong</div>;
};

export default withSentry(App);

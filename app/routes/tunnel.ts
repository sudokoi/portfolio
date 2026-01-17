import type { ActionFunctionArgs } from "@remix-run/cloudflare";

const SENTRY_TUNNEL_URL =
  "https://o4507639875239936.ingest.us.sentry.io/api/4507639877992448/envelope/";

const BUILD_DATE =
  import.meta.env.BUILD_DATE ?? new Date().toISOString().split("T")[0];

export const lastmod = BUILD_DATE;

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const upstreamResponse = await fetch(SENTRY_TUNNEL_URL, {
    method: "POST",
    body: request.body,
    headers: {
      "Content-Type":
        request.headers.get("Content-Type") ?? "application/x-sentry-envelope",
    },
  });

  return new Response(await upstreamResponse.arrayBuffer(), {
    status: upstreamResponse.status,
    headers: {
      "content-type":
        upstreamResponse.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    },
  });
}

export function loader() {
  return new Response("Not Found", { status: 404 });
}

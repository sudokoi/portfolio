import type { LoaderFunction } from "@remix-run/cloudflare";
import resumeUrl from "~/assets/resume/Sudhanshu_Ranjan____Resume____Dec_2025.pdf";

const BUILD_DATE =
  import.meta.env.BUILD_DATE ?? new Date().toISOString().split("T")[0];

export const lastmod = BUILD_DATE;

export const loader: LoaderFunction = async ({ request }) => {
  const assetUrl = new URL(resumeUrl, request.url);
  const response = await fetch(assetUrl.toString());

  if (!response.ok) {
    throw new Response("Resume not found", { status: 404 });
  }

  const buffer = await response.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Sudhanshu_Ranjan_Resume.pdf"',
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};

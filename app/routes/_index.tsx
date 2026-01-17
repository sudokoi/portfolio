import type { MetaFunction } from "@remix-run/cloudflare";
import { Intro } from "~/components/intro";
import { TWITTER_HANDLE } from "~/utils/contants";

const BUILD_DATE =
  import.meta.env.BUILD_DATE ?? new Date().toISOString().split("T")[0];

export const lastmod = BUILD_DATE;

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

export default function Index() {
  return (
    <div className="h-full w-full text-base font-medium">
      <Intro />
    </div>
  );
}

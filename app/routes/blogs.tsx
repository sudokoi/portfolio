import { Link, useLoaderData } from "@remix-run/react";
import { cn } from "~/lib/utils";
import { parse } from "date-fns/parse";
import { TWITTER_HANDLE } from "~/utils/contants";

function BlogCard({
  link,
  title,
  description,
  date,
  className,
}: {
  link: string;
  title: string;
  description: string;
  date: string;
  className?: string;
}) {
  return (
    <Link
      to={link}
      className={cn(
        "w-full rounded-lg border border-secondary shadow-lg hover:border-accent focus:border-none focus:outline-none focus:ring focus:ring-accent md:w-1/2 lg:w-1/3",
        className,
      )}
    >
      <div className="flex h-full flex-col gap-4 p-4 text-primary">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-secondary">{description}</p>
        <p className="mt-auto pt-2 text-sm text-accent">{date}</p>
      </div>
    </Link>
  );
}

export const loader = () => {
  // adapted from: https://github.com/remix-run/remix-website/blob/3cbd79fb69bbc3a4bf8c7c13ecfef0e1ba33ede8/app/lib/blog.server.ts#L8
  const postContentBySlug = Object.fromEntries(
    Object.entries(
      import.meta.glob("./**/*.mdx", {
        import: "frontmatter",
        eager: true,
      }),
    )
      .map(([filePath, contents]) => {
        return [
          filePath
            .replace("./", "/")
            .replace(".", "/")
            .replace(/\.mdx$/, ""),
          contents,
        ];
      })
      .sort(([, aContent], [, bContent]) => {
        // Sort by date in descending order
        try {
          // @ts-expect-error - we know the shape of the content
          const aDate = parse(aContent.date, "MMM dd, yyyy", new Date());
          // @ts-expect-error - we know the shape of the content
          const bDate = parse(bContent.date, "MMM dd, yyyy", new Date());

          return bDate.getTime() - aDate.getTime();
        } catch (e) {
          return 0;
        }
      }),
  ) as Record<
    string,
    {
      /** Title of the blog */
      title: string;
      /** Description of the blog */
      description: string;
      /** Authored date in MMM DD, YYYY format (e.g. Sep 09, 2024) */
      date: string;
    }
  >;

  return postContentBySlug;
};

export const meta = () => {
  return [
    {
      title: "Sudhanshu's Blogs",
      description: "A collection of blogs written by me.",
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

export default function Blogs() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      In this small corner of the internet, I write about things that interest
      me. Here are some of my posts:
      <div className="flex h-full w-full flex-wrap gap-4 py-4">
        {Object.entries(data).map(([slug, { title, description, date }]) => (
          <BlogCard
            key={slug}
            link={slug}
            title={title}
            description={description}
            date={date}
            className="min-h-[12rem]"
          />
        ))}
      </div>
    </div>
  );
}

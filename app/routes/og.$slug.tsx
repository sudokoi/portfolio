import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { isOpenGraphImageRequest, OpenGraphImageData } from "remix-og-image";
import invariant from "tiny-invariant";
import logoUrl from "~/assets/images/logo.png";
import { TWITTER_HANDLE } from "~/utils/contants";

const WEBSITE_URL = "https://sudh.online";

const getBlogDetails = async () => {
  return Object.entries(
    import.meta.glob("./**/*.mdx", {
      import: "frontmatter",
      eager: true,
    }),
  ).map(([filePath, contents]) => {
    return [
      filePath
        .replace("./", "/")
        .replace(".", "/")
        .replace(/\.mdx$/, ""),
      contents,
    ] as [string, { title: string; description: string; date: string }];
  });
};

const indexOgData = {
  // default og image for the root route
  name: "index-og-image",
  params: {
    slug: "index-og-image",
  },
};

export async function openGraphImage() {
  // Return a dynamic number of OG image entries
  // based on your data. The plugin will automatically
  // provide the "params" to this route when
  // visiting each alternation of this page in the browser.
  const data = (await getBlogDetails()).map<OpenGraphImageData>(
    ([filepath]) => {
      const slug = filepath.split("/").pop()!;

      return {
        name: slug,
        params: {
          slug: slug,
        },
      };
    },
  );

  return [indexOgData, ...data];
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  // check if the incoming request is a meta request
  // from the plugin. Use the `isOpenGraphImageRequest` utility from the library.
  if (isOpenGraphImageRequest(request)) {
    /**
     * @note Throw the OG image response instead of returning it.
     * This way, you don't have to deal with the `loader` function
     * returning a union of OG image data and the actual data
     * returned to the UI component.
     */
    throw json(await openGraphImage());
  }

  invariant(params, "Params should be defined for this route");
  invariant(params.slug, "Slug should be defined for this route");

  const normalizedSlug = params.slug.replace(/\.jpe?g$/i, "");

  const currentBlog = (await getBlogDetails()).find(([filePath]) =>
    filePath.includes(normalizedSlug),
  );

  if (currentBlog) {
    return json({
      title: currentBlog[1].title,
      description: currentBlog[1].description,
    });
  } else {
    // if the slug is not found, return the default OG image data
    return json({
      title: "Sudhanshu's Corner",
      description: "Thoughts and musings of a developer",
    });
  }
}

export default function Template() {
  const data = useLoaderData<typeof loader>();

  return (
    <div
      className="flex h-[420px] w-[800px] scale-75 flex-col bg-[#F3F2F8] p-4 text-[#363681]"
      style={{
        background: "linear-gradient(to bottom right, #FFF8E3, #E6A4B4)",
      }}
      id="og-image"
    >
      <div className="mb-auto flex w-full items-center">
        <img src={logoUrl} alt="" aria-hidden={true} className="h-16 w-16" />
        <div className="border-b-2 border-[#2646BA] text-2xl font-bold">
          Sudhanshu&#39;s Blogs
        </div>
      </div>
      <section className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="text-4xl font-bold text-black">{data.title}</div>
        <p className="text-center text-lg text-[#363681]">{data.description}</p>
      </section>
      <div className="flex px-4">
        <div className="mr-auto text-lg">{WEBSITE_URL}</div>
        <div className="ml-auto text-lg">{`@${TWITTER_HANDLE}`}</div>
      </div>
    </div>
  );
}

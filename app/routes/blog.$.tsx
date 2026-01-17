import { json } from "@remix-run/cloudflare";

export const loader = () => {
  throw json(null, { status: 404 });
};

// it would be better to throw 404 from the loader function
// and catch the error in a custom error boundary in the layout itself

export default function BlogSplat() {
  return null;
}

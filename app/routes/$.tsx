import { json } from "@remix-run/cloudflare";
import { NotFoundPage } from "~/components/not-found";

export const loader = () => {
  return json(null, { status: 404 });
};

export default function NotFound() {
  return <NotFoundPage />;
}

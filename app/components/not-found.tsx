import { Link } from "@remix-run/react";

export function NotFoundPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 py-16 text-primary">
      <h1 className="text-2xl font-bold">404 — Page not found</h1>
      <p className="text-secondary">
        The page you’re looking for doesn’t exist.
      </p>
      <div className="flex items-center gap-4">
        <Link
          to="/"
          reloadDocument
          className="text-accent underline underline-offset-4 focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
        >
          Go home
        </Link>
        <Link
          to="/blogs"
          reloadDocument
          className="text-accent underline underline-offset-4 focus:rounded focus:outline-none focus:ring-[1px] focus:ring-accent focus:ring-offset-2"
        >
          Browse blogs
        </Link>
      </div>
    </div>
  );
}

import { cn } from "~/lib/utils";
import { GITHUB_HANDLE } from "~/utils/contants";

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("flex gap-2", className)}>
      <p className="text-secondary">Made with ❤️ by Sudhanshu</p>
      <a
        href={`https://github.com/${GITHUB_HANDLE}/portfolio`}
        className="ml-auto text-accent hover:underline focus:outline-none focus:ring-[1px] focus:ring-accent"
        target="_blank"
        rel="noreferrer"
      >
        [view-source]
      </a>
    </footer>
  );
}

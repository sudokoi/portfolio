import logo from "~/assets/images/logo.png?url";
import { Sparkles } from "./sparkles";
import { Link } from "@remix-run/react";
import { cn } from "~/lib/utils";

export function Nav() {
  return (
    <nav
      className={cn(
        "sticky top-0 mx-auto flex w-full max-w-7xl items-center bg-tertiary px-6 py-5 sm:px-16",
      )}
    >
      <div className="mx-auto flex w-full items-center justify-between">
        <Link
          to="/"
          reloadDocument
          className="flex items-center gap-2 focus:rounded-lg focus:outline-none focus:ring focus:ring-accent focus:ring-offset-2"
        >
          <img
            src={logo}
            alt="logo"
            className="size-10 object-contain saturate-200"
          />
          <Sparkles>
            <p className="cursor-pointer text-2xl font-bold text-primary">
              Sudhanshu
            </p>
          </Sparkles>
        </Link>

        <Link
          to="/blogs"
          reloadDocument
          className="cursor-pointer text-lg text-accent underline-offset-2 hover:underline focus:rounded-lg focus:outline-none focus:ring focus:ring-accent focus:ring-offset-2"
        >
          /blogs
        </Link>
      </div>
    </nav>
  );
}

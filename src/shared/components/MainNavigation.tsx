'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MainNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation">
      <Link
        href="/projects"
        prefetch={false}
        aria-current={pathname === '/projects' ? 'page' : undefined}
      >
        /projects
      </Link>
      <Link
        href="/blogs"
        prefetch={false}
        aria-current={
          pathname === '/blogs' ? 'page' : pathname.startsWith('/blog/') ? 'location' : undefined
        }
      >
        /blogs
      </Link>
      <a href="/resume" data-umami-event="resume_link_click">
        /resume
      </a>
    </nav>
  );
}

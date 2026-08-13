"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "All Programs" },
  { href: "/custom", label: "Key Data View" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/program");
  return pathname.startsWith(href);
}

export default function Navbar({ programCount }: { programCount: number }) {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <nav className="flex h-14 w-full items-center gap-4 px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">
            N
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-gray-900">
            Neurology Programs
          </span>
          <span className="hidden rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-500 sm:inline-block">
            {programCount} programs
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={
                isActive(pathname, href)
                  ? "rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                  : "rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

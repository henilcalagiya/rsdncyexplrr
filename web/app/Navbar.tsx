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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <nav className="flex h-[52px] w-full items-center gap-8 px-8">
        <Link
          href="/"
          className="flex items-center gap-2 whitespace-nowrap text-[15px] font-semibold tracking-tight text-gray-900"
        >
          <span className="text-lg text-gray-600">◎</span>
          Neurology Programs
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            {programCount}
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={
                isActive(pathname, href)
                  ? "rounded-md bg-gray-100 px-3 py-1.5 text-[13px] font-medium text-gray-900"
                  : "rounded-md px-3 py-1.5 text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
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

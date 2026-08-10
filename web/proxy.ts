import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const AUTH_COOKIE = "re_auth";
export const AUTH_TOKEN = "ok-b1fbce08ee8a4945";

export function proxy(request: NextRequest) {
  if (request.cookies.get(AUTH_COOKIE)?.value === AUTH_TOKEN) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!login|api/login|_next/static|_next/image|favicon.ico).*)"],
};

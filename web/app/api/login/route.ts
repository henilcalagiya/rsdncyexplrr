import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, AUTH_TOKEN } from "@/proxy";

const PASSWORD = "asdfasdfqwerty";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  if (form.get("password") !== PASSWORD) {
    return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
  }
  const res = NextResponse.redirect(new URL("/", request.url), 303);
  res.cookies.set(AUTH_COOKIE, AUTH_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

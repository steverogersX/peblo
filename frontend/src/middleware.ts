import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Always accessible, no auth required
const ALWAYS_PUBLIC = ["/view"];
// Redirect to dashboard if already logged in
const AUTH_PATHS = ["/login", "/signup"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = req.cookies.has("token");

  if (ALWAYS_PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (!hasToken && !isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasToken && isAuthPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};

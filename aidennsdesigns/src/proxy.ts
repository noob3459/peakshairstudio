import { NextResponse, type NextRequest } from "next/server";

// First line of defense only: keeps admin/preview out of caches and indexes and bounces visitors without a
// session cookie to the login page. Real authorization happens server-side in every page, action and route handler.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasCookie = req.cookies.has(process.env.NODE_ENV === "production" ? "__Host-ad_session" : "ad_session");
  if (!hasCookie && !pathname.startsWith("/admin/login") && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = { matcher: ["/admin/:path*", "/preview/:path*", "/api/admin/:path*"] };

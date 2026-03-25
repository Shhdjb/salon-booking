import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

/**
 * Auth.js replaces `req.url` origin with `AUTH_URL`, so redirects would use the wrong port in dev.
 * `Host` still reflects the browser request (e.g. localhost:3003).
 */
function redirectPath(req: NextRequest, path: string, search?: Record<string, string>) {
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : new URL(req.url).origin;
  const target = new URL(path, `${origin}/`);
  if (search) {
    for (const [k, v] of Object.entries(search)) {
      target.searchParams.set(k, v);
    }
  }
  return NextResponse.redirect(target);
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isBookRoute = nextUrl.pathname === "/book";
  const isProfileRoute = nextUrl.pathname === "/profile";

  if (isAdminRoute && !isLoggedIn) {
    return redirectPath(req, "/login", { callbackUrl: "/admin" });
  }

  if (isAdminRoute && isLoggedIn && req.auth?.user?.role !== "ADMIN") {
    return redirectPath(req, "/unauthorized");
  }

  if ((isBookRoute || isProfileRoute) && !isLoggedIn) {
    return redirectPath(req, "/login", { callbackUrl: nextUrl.pathname });
  }

  return;
});

export const config = {
  matcher: ["/admin/:path*", "/book", "/profile"],
};

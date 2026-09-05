import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Enterprise Route Protection & Security Proxy
 * Independent multi-tier security:
 * 1. Admin Console: /admin/:path* guarded by `sakil_admin_token`
 * 2. Student Portal & Checkout: /dashboard/:path* and /checkout/:path* strictly guarded by `sakil_customer_token`
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const adminToken = request.cookies.get("sakil_admin_token")?.value;
  const customerToken = request.cookies.get("sakil_customer_token")?.value;

  // 1. Admin Console Route Protection
  if (pathname.startsWith("/admin")) {
    const isAdminLogin = pathname === "/admin/login";
    const hasValidAdminToken = Boolean(
      adminToken &&
      (adminToken.startsWith("adm_v2_") ||
       adminToken.startsWith("eyJ") ||
       adminToken.startsWith("adm_jwt_"))
    );

    // Unauthenticated user trying to access admin panel -> redirect to /admin/login
    if (!isAdminLogin && !hasValidAdminToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Authenticated admin trying to access /admin/login -> redirect to /admin
    if (isAdminLogin && hasValidAdminToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  // 2. Student Portal, Classroom & Checkout Protection (Dashboard, Learn, and Checkout strictly require active session)
  const isStudentProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/learn");

  const isStudentAuthPath =
    pathname === "/login" || pathname === "/register";

  // Redirect unauthenticated students attempting to access protected dashboard or checkout routes
  if (isStudentProtectedPath && !customerToken) {
    const loginUrl = new URL("/login", request.url);
    const redirectTarget = request.nextUrl.search
      ? `${pathname}${request.nextUrl.search}`
      : pathname;
    loginUrl.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated students away from login/register pages
  if (isStudentAuthPath && customerToken) {
    const hasError = searchParams.has("error");
    const isLogout = searchParams.get("logout") === "true";
    if (!hasError && !isLogout) {
      const redirectParam = searchParams.get("redirect");
      const target =
        redirectParam && redirectParam.startsWith("/")
          ? redirectParam
          : "/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Static asset file extensions (svg, png, jpg, jpeg, gif, webp, mp4, woff, woff2)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|woff|woff2)$).*)",
  ],
};

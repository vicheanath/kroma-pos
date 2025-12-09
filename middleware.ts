import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/auth/signin", "/api/auth"];

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/sales", "/products", "/categories"];

// Routes that require specific roles
const roleBasedRoutes: Record<string, string[]> = {
  "/employees": ["admin", "manager"],
  "/settings": ["admin", "manager"],
  "/reports": ["admin", "manager", "cashier"],
  "/inventory": ["admin", "manager"],
  "/data-export": ["admin"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute =
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    Object.keys(roleBasedRoutes).some((route) => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check for NextAuth session cookie instead of calling auth()
  // This avoids BroadcastChannel issues in Edge Runtime
  // NextAuth v5 uses "authjs.session-token" by default
  const isProduction = process.env.NODE_ENV === "production";
  const sessionToken =
    request.cookies.get(
      isProduction ? "__Secure-authjs.session-token" : "authjs.session-token"
    ) ||
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  // If no session token, redirect to signin
  if (!sessionToken) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // For role-based routes, we'll let the client-side AuthGuard handle it
  // since we can't decode the JWT in Edge Runtime without BroadcastChannel
  // The middleware just checks if user is authenticated (has session cookie)
  // Role checks happen client-side via AuthGuard component

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth routes - handled by API route with Node.js runtime)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

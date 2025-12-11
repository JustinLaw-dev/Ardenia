import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  // Define public routes (accessible without login)
  const publicRoutes = [
    "/login",
    "/signup",
    "/reset-password",
    "/auth/callback",
    "/auth/reset-password",
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Check if user is authenticated (user object exists and has an id)
  const isAuthenticated = user && user.id;

  // Redirect to login if not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if authenticated and trying to access login/signup
  if (
    isAuthenticated &&
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/signup")
  ) {
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/tasks/:path*",
    "/gamify/:path*",
    "/dashboard/:path*",
    "/users/:path*",
    "/login",
    "/signup",
    "/reset-password/:path*",
    "/auth/:path*",
  ],
};

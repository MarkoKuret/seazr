export { auth as middleware } from "@/auth"
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Protected routes - add your protected paths here
  const protectedPaths = ["/dashboard", "/profile"];
  const path = request.nextUrl.pathname;

  if (!session && protectedPaths.some(prefix => path.startsWith(prefix))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware is applied to
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/login",
  ],
};
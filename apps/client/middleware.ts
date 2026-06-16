import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET_KEY!;
const encodedKey = new TextEncoder().encode(secretKey);

// Routes that don't require authentication
const publicPaths = ["/", "/auth/signin", "/auth/signup"];

function isPublicPath(pathname: string) {
  return publicPaths.includes(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, encodedKey, {
      algorithms: ["HS256"],
    });

    // Extract role from the payload (matches schema in session.ts)
    const user = payload.user as { role?: string } | undefined;
    const role = user?.role;

    // Protect dashboard routes (Only allow Admin and Instructor)
    if (pathname.startsWith("/dashboard")) {
      const roleStr = role?.toLowerCase();
      if (roleStr !== "instructor" && roleStr !== "admin") {
        return NextResponse.redirect(new URL("/my-courses", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Invalid or expired session — clear cookie and redirect
    const response = NextResponse.redirect(
      new URL("/auth/signin", request.url),
    );
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: [
    "/",
    "/orders",
    "/cart",
    "/checkout",
    "/dashboard/:path*",
    "/favorites",
    "/course/:path*/learn",
    "/course/payment-success",

    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    // '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

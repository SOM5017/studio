import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose';

// This secret is used to verify the JWT. It should be in an environment variable.
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-for-dev');

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // If logged in, redirect from customer view to owner view
  if (session && pathname === '/') {
    try {
      await jwtVerify(session, secret);
      return NextResponse.redirect(new URL('/owner', request.url));
    } catch (err) {
      // Invalid token, let them stay but clear cookie
      const response = NextResponse.next();
      response.cookies.delete('session');
      return response;
    }
  }

  // Protect the /owner route and its children
  if (pathname.startsWith('/owner')) {
    if (!session) {
      // If no session cookie, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify the session token
      await jwtVerify(session, secret);
      // If verification is successful, allow the request to proceed
      return NextResponse.next();
    } catch (err) {
      // If verification fails (e.g., expired or invalid token), redirect to login
      console.error('Failed to verify session', err);
      // It's good practice to clear the invalid cookie
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

// The matcher configuration ensures this middleware runs only for the specified paths.
export const config = {
  matcher: ['/owner/:path*', '/login', '/'],
}

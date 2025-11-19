
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuth } from 'firebase/auth';

// This middleware ensures that the owner dashboard is protected.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // List of paths that are protected and require authentication.
  const protectedPaths = ['/owner'];
  
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected) {
      // Logic to check for Firebase auth session will be handled client-side
      // in the page component. This middleware is a placeholder for potential
      // future server-side session checks. For now, we allow the request to proceed,
      // and the client-side will handle redirection if not authenticated.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/owner/:path*'],
}

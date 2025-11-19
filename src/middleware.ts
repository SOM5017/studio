
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware is no longer needed for auth redirection as it's handled
// by the components using the `useUser` hook.

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // We can remove the matcher to disable the middleware for now.
  // matcher: ['/owner/:path*', '/login'],
}

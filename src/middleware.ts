
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/app/actions';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const session = cookies().get('session')?.value;
  const sessionData = session ? await decrypt(session) : null;
  
  const isOwnerPath = request.nextUrl.pathname.startsWith('/owner');
  const isLoginPath = request.nextUrl.pathname.startsWith('/login');

  // If trying to access owner page and not logged in, redirect to login
  if (isOwnerPath && !sessionData) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If trying to access login page and already logged in, redirect to owner page
  if (isLoginPath && sessionData) {
    return NextResponse.redirect(new URL('/owner', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Only run the middleware on owner and login routes
  matcher: ['/owner/:path*', '/login'],
}

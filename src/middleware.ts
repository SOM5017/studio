import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  if (request.nextUrl.pathname.startsWith('/owner')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(session, secret);
      return NextResponse.next();
    } catch (err) {
      console.error('Failed to verify session', err);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/login')) {
    if(session) {
        try {
            await jwtVerify(session, secret);
            return NextResponse.redirect(new URL('/owner', request.url));
        } catch (err) {
            // Invalid token, let them log in again
        }
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/owner/:path*', '/login'],
}

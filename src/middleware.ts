
import { type NextRequest } from "next/server";
import { getSession } from "./app/actions";
import { NextResponse } from "next/server";

const protectedRoutes = ["/owner"];

export default async function middleware(req: NextRequest) {
  const session = await getSession();
  const isProtectedRoute = protectedRoutes.some((prefix) =>
    req.nextUrl.pathname.startsWith(prefix)
  );

  if (!session && isProtectedRoute) {
    const absoluteURL = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  if (session && req.nextUrl.pathname.startsWith('/login')) {
    const absoluteURL = new URL("/owner", req.nextUrl.origin);
    return NextResponse.redirect(absoluteURL.toString());
  }

  return NextResponse.next();
}

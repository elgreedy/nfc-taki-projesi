import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPrefixes = ['/admin'];
const allowlist = ['/admin/login', '/api/admin/login', '/api/admin/logout'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (allowlist.some((path) => pathname === path || pathname.startsWith('/api/admin/'))) {
    return NextResponse.next();
  }

  const isAdminRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const isAuthenticated = request.cookies.get('admin-auth')?.value === 'true';
  if (isAuthenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

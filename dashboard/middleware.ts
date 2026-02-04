import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Must match next.config basePath (e.g. /admin when served at tobodigital.com/admin)
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login, forgot-password, reset-password pages and public assets
  if (pathname.startsWith('/login') ||
      pathname.startsWith('/forgot-password') ||
      pathname.startsWith('/reset-password') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.match(/\.(png|jpg|jpeg|svg|gif|ico)$/)) {
    return NextResponse.next();
  }

  // Check for auth token in cookies or headers
  const authToken = request.cookies.get('authToken')?.value ||
                    request.headers.get('authorization')?.replace('Bearer ', '');

  // If no token and trying to access protected routes, redirect to login
  if (!authToken && pathname !== '/login') {
    const loginUrl = new URL(`${BASE_PATH}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If has token and on login page, redirect to dashboard home
  if (authToken && pathname === '/login') {
    return NextResponse.redirect(new URL(BASE_PATH || '/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


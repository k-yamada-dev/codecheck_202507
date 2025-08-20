// middleware.ts
import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const { token } = request.nextauth;
    const { pathname } = request.nextUrl;

    // Check for admin route access
    if (pathname.startsWith('/admin')) {
      if (!token?.roles?.includes(Role.INTERNAL_ADMIN)) {
        // Redirect to dashboard if not an internal admin
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/encode',
    '/decode',
    '/image-management',
    '/user-management',
    '/watermark',
    '/log',
    '/dashboard',
    '/admin/:path*', // Protect all admin routes
  ],
};

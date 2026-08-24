import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { routePermissions } from '@/config/nav-config';
import { can } from '@/lib/can';

const isProtectedRoute = (pathname: string) => pathname.startsWith('/dashboard') || pathname.startsWith('/pos');
const FALLBACK_PATH = '/dashboard/overview';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!isProtectedRoute(pathname)) {
    return;
  }

  if (!req.auth) {
    const signInUrl = new URL('/auth/sign-in', req.nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  const requiredPermissions = routePermissions[pathname];
  if (pathname !== FALLBACK_PATH && requiredPermissions && !can(req.auth.permissions, requiredPermissions)) {
    return NextResponse.redirect(new URL(FALLBACK_PATH, req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};

import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const isProtectedRoute = (pathname: string) => pathname.startsWith('/dashboard');

export default auth((req) => {
  if (isProtectedRoute(req.nextUrl.pathname) && !req.auth) {
    const signInUrl = new URL('/auth/sign-in', req.nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
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

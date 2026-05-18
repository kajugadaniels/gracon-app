/**
 * App-level route proxy for auth gating in the identity app.
 *
 * This file keeps public auth/session routes reachable without a session hint
 * and redirects protected surfaces to login with a safe return destination.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authCookiePolicy } from '@/lib/auth/session-cookie-policy';

const AUTH_ROUTES = [
    '/login',
    '/register',
    '/verify-email',
    '/verify',
    '/forgot-password',
    '/reset-password',
    '/logout',
];

/**
 * Routes unauthenticated users away from protected pages while keeping logout
 * public so cross-app sign-out cannot become a post-login redirect target.
 */
export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const hasSession = req.cookies.has(authCookiePolicy.sessionHintCookieName);

    const isAuthRoute = AUTH_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    if (isAuthRoute && hasSession) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (!isAuthRoute && !hasSession) {
        const loginUrl = new URL('/login', req.url);
        const fullPath = `${pathname}${req.nextUrl.search}`;
        loginUrl.searchParams.set('next', fullPath);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
    ],
};

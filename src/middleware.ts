import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Route definitions ──────────────────────────────────────────
// AUTH_ROUTES: accessible only when NOT logged in
// All other non-static routes require authentication
const AUTH_ROUTES = [
    '/login',
    '/register',
    '/verify-email',
];

// Session indicator cookie — just a boolean flag, no sensitive data
// Real tokens live in Zustand store (in-memory) — XSS safe
const SESSION_COOKIE = 'session_active';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const hasSession = req.cookies.has(SESSION_COOKIE);

    const isAuthRoute = AUTH_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    // ── Logged-in user tries to access auth pages ─────────────────
    // Redirect them to dashboard — they don't need to login again
    if (isAuthRoute && hasSession) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // ── Unauthenticated user tries to access protected pages ───────
    // Redirect to login, preserve intended destination in ?next param
    if (!isAuthRoute && !hasSession) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all paths EXCEPT:
         * - _next/static  (Next.js static assets)
         * - _next/image   (Next.js image optimization)
         * - favicon.ico
         * - Public image files
         */
        '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
    ],
};
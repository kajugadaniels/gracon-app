import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require the user to be logged in
const PROTECTED_ROUTES = ['/dashboard', '/verify-identity'];

// Routes only accessible when NOT logged in
const AUTH_ROUTES = ['/login', '/register'];

// We store a "session indicator" cookie (no sensitive data)
// The actual token is in the Zustand store (in-memory)
// This cookie is just a boolean flag so middleware can make decisions
const SESSION_COOKIE = 'session_active';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const hasSession = req.cookies.has(SESSION_COOKIE);

    // Redirect logged-in users away from auth pages
    if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
        if (hasSession) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }

    // Redirect unauthenticated users away from protected pages
    if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
        if (!hasSession) {
            const loginUrl = new URL('/login', req.url);
            loginUrl.searchParams.set('next', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all routes except Next.js internals and static files
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)).*)',
    ],
};
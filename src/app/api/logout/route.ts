import { NextRequest, NextResponse } from 'next/server';
import { authCookiePolicy } from '@/lib/auth/session-cookie-policy';

const AUTH_BASE =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

function clearSharedAuthCookies(response: NextResponse) {
    const sameSite = authCookiePolicy.cookieSameSite.toLowerCase() as
        | 'strict'
        | 'lax'
        | 'none';
    const options = {
        maxAge: 0,
        path: '/',
        sameSite,
        secure: authCookiePolicy.cookieSecure,
        domain: authCookiePolicy.cookieDomain,
    };

    response.cookies.set(authCookiePolicy.accessCookieName, '', options);
    response.cookies.set(authCookiePolicy.refreshCookieName, '', options);
    response.cookies.set(authCookiePolicy.sessionHintCookieName, '', options);
    return response;
}

export async function POST(request: NextRequest) {
    let refreshToken =
        request.cookies.get(authCookiePolicy.refreshCookieName)?.value ?? null;

    if (!refreshToken) {
        try {
            const body = await request.json();
            refreshToken =
                typeof body?.refreshToken === 'string' ? body.refreshToken : null;
        } catch {
            refreshToken = null;
        }
    }

    if (refreshToken) {
        try {
            await fetch(`${AUTH_BASE}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
                cache: 'no-store',
            });
        } catch {
            // Logout must still clear local shared cookies even when the auth
            // service is temporarily unavailable or the token was already dead.
        }
    }

    return clearSharedAuthCookies(NextResponse.json({ success: true }));
}

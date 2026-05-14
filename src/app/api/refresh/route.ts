import { NextRequest, NextResponse } from 'next/server';
import { authCookiePolicy } from '@/lib/auth/session-cookie-policy';

const AUTH_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export async function POST(req: NextRequest) {
    const refreshToken = req.cookies.get(authCookiePolicy.refreshCookieName)?.value;

    if (!refreshToken) {
        return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    try {
        const res = await fetch(`${AUTH_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
            cache: 'no-store',
        });

        if (!res.ok) {
            const response = NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
            response.cookies.set(authCookiePolicy.accessCookieName, '', { maxAge: 0, path: '/' });
            response.cookies.set(authCookiePolicy.refreshCookieName, '', { maxAge: 0, path: '/' });
            return response;
        }

        const data = await res.json();
        const { accessToken, refreshToken: newRefreshToken } = data?.data ?? data;

        const response = NextResponse.json({ accessToken });
        const sameSite = authCookiePolicy.cookieSameSite.toLowerCase() as
            | 'strict'
            | 'lax'
            | 'none';

        response.cookies.set(authCookiePolicy.accessCookieName, accessToken, {
            maxAge: authCookiePolicy.accessTokenMaxAgeSeconds,
            path: '/',
            sameSite,
            secure: authCookiePolicy.cookieSecure,
            httpOnly: true,
            domain: authCookiePolicy.cookieDomain,
        });
        response.cookies.set(authCookiePolicy.refreshCookieName, newRefreshToken, {
            maxAge: authCookiePolicy.refreshTokenMaxAgeSeconds,
            path: '/',
            sameSite,
            secure: authCookiePolicy.cookieSecure,
            httpOnly: true,
            domain: authCookiePolicy.cookieDomain,
        });
        return response;
    } catch {
        return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
    }
}

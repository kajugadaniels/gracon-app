import { NextRequest, NextResponse } from 'next/server';
import { authCookiePolicy } from '@/lib/auth/session-cookie-policy';

// This route is called by app/documents on load to bootstrap the session.
// It reads the g360_at cookie and returns the user profile from api/auth/.
// app/documents never stores its own JWT — it reads it from the shared cookie.

const AUTH_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

async function fetchProfile(accessToken: string) {
    return fetch(`${AUTH_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
    });
}

async function refreshSession(refreshToken: string) {
    const response = await fetch(`${AUTH_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    const payload = data?.data ?? data;

    return {
        accessToken: payload?.accessToken as string | undefined,
        refreshToken: payload?.refreshToken as string | undefined,
    };
}

function clearSessionCookies(response: NextResponse) {
    response.cookies.set(authCookiePolicy.accessCookieName, '', { maxAge: 0, path: '/' });
    response.cookies.set(authCookiePolicy.refreshCookieName, '', { maxAge: 0, path: '/' });
    response.cookies.set(authCookiePolicy.sessionHintCookieName, '', { maxAge: 0, path: '/' });
    return response;
}

function applySessionCookies(
    response: NextResponse,
    accessToken: string,
    refreshToken: string,
) {
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
    response.cookies.set(authCookiePolicy.refreshCookieName, refreshToken, {
        maxAge: authCookiePolicy.refreshTokenMaxAgeSeconds,
        path: '/',
        sameSite,
        secure: authCookiePolicy.cookieSecure,
        httpOnly: true,
        domain: authCookiePolicy.cookieDomain,
    });
    response.cookies.set(authCookiePolicy.sessionHintCookieName, '1', {
        maxAge: authCookiePolicy.refreshTokenMaxAgeSeconds,
        path: '/',
        sameSite,
        secure: authCookiePolicy.cookieSecure,
        domain: authCookiePolicy.cookieDomain,
    });

    return response;
}

export async function GET(req: NextRequest) {
    let accessToken = req.cookies.get(authCookiePolicy.accessCookieName)?.value ?? null;
    const refreshToken =
        req.cookies.get(authCookiePolicy.refreshCookieName)?.value ?? null;
    let refreshedTokens:
        | {
              accessToken: string;
              refreshToken: string;
          }
        | null = null;

    try {
        if (!accessToken && refreshToken) {
            const refreshed = await refreshSession(refreshToken);
            if (refreshed?.accessToken && refreshed.refreshToken) {
                accessToken = refreshed.accessToken;
                refreshedTokens = refreshed as {
                    accessToken: string;
                    refreshToken: string;
                };
            }
        }

        if (!accessToken) {
            return clearSessionCookies(
                NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
            );
        }

        let profileResponse = await fetchProfile(accessToken);

        if (!profileResponse.ok && refreshToken) {
            const refreshed = await refreshSession(refreshToken);
            if (refreshed?.accessToken && refreshed.refreshToken) {
                accessToken = refreshed.accessToken;
                refreshedTokens = refreshed as {
                    accessToken: string;
                    refreshToken: string;
                };
                profileResponse = await fetchProfile(accessToken);
            }
        }

        if (!profileResponse.ok) {
            return clearSessionCookies(
                NextResponse.json({ error: 'Session expired' }, { status: 401 }),
            );
        }

        const data = await profileResponse.json();
        const profile = data?.data ?? data;
        const effectiveRefreshToken =
            refreshedTokens?.refreshToken ?? refreshToken ?? null;

        const response = NextResponse.json({
            accessToken,
            refreshToken: effectiveRefreshToken,
            user: {
                userId: profile?.id ?? '',
                email: profile?.email ?? '',
                phoneNumber: profile?.phoneNumber ?? null,
                imageUrl: profile?.profileImageUrl ?? null,
                surName: profile?.citizenIdentity?.surName ?? '',
                postNames: profile?.citizenIdentity?.postNames ?? '',
                sex: profile?.citizenIdentity?.sex ?? '',
                isIdVerified: Boolean(profile?.isIdVerified),
                idVerifiedAt: profile?.idVerifiedAt ?? null,
                createdAt: profile?.createdAt ?? '',
            },
        });

        if (refreshedTokens) {
            applySessionCookies(
                response,
                refreshedTokens.accessToken,
                refreshedTokens.refreshToken,
            );
        }

        return response;
    } catch {
        return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
    }
}

import { NextRequest, NextResponse } from 'next/server';

const AUTH_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export async function POST(req: NextRequest) {
    const refreshToken = req.cookies.get('g360_rt')?.value;

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
            response.cookies.set('g360_at', '', { maxAge: 0, path: '/' });
            response.cookies.set('g360_rt', '', { maxAge: 0, path: '/' });
            return response;
        }

        const data = await res.json();
        const { accessToken, refreshToken: newRefreshToken } = data?.data ?? data;

        const response = NextResponse.json({ accessToken });
        const maxAge = 60 * 60 * 24 * 30;
        response.cookies.set('g360_at', accessToken, { maxAge, path: '/', sameSite: 'lax' });
        response.cookies.set('g360_rt', newRefreshToken, { maxAge, path: '/', sameSite: 'lax' });
        return response;
    } catch {
        return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
    }
}
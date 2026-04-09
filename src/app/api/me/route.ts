import { NextRequest, NextResponse } from 'next/server';

// This route is called by app/documents on load to bootstrap the session.
// It reads the g360_at cookie and returns the user profile from api/auth/.
// app/documents never stores its own JWT — it reads it from the shared cookie.

const AUTH_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('g360_at')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const res = await fetch(`${AUTH_BASE}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });

        if (!res.ok) {
            // Token is invalid or expired — clear the cookies
            const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
            response.cookies.set('g360_at', '', { maxAge: 0, path: '/' });
            response.cookies.set('g360_rt', '', { maxAge: 0, path: '/' });
            return response;
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 });
    }
}
import axios, { AxiosError } from 'axios';

const AUTH_BASE =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const DEFAULT_ACCESS_TOKEN_TTL = '15m';
const DEFAULT_REFRESH_TOKEN_TTL = '1d';
const ACCESS_COOKIE =
    process.env.NEXT_PUBLIC_AUTH_ACCESS_COOKIE_NAME?.trim() || 'g360_at';
const REFRESH_COOKIE =
    process.env.NEXT_PUBLIC_AUTH_REFRESH_COOKIE_NAME?.trim() || 'g360_rt';
const SESSION_HINT_COOKIE =
    process.env.NEXT_PUBLIC_AUTH_SESSION_HINT_COOKIE_NAME?.trim() ||
    'session_active';

function parseDurationSeconds(value: string | undefined, fallback: string): number {
    const source = value ?? fallback;
    const match = /^(\d+)([smhd])$/.exec(source.trim().toLowerCase());

    if (!match) return parseDurationSeconds(fallback, '1d');

    const amount = Number(match[1]);
    const unit = match[2];

    if (unit === 's') return amount;
    if (unit === 'm') return amount * 60;
    if (unit === 'h') return amount * 60 * 60;
    return amount * 60 * 60 * 24;
}

function shouldWriteReadableAuthCookies(): boolean {
    const explicit = process.env.NEXT_PUBLIC_ALLOW_DEV_READABLE_AUTH_COOKIES;

    if (explicit === 'true') return true;
    if (explicit === 'false') return false;

    return process.env.NODE_ENV !== 'production';
}

function serializeClientCookie(name: string, value: string, maxAge: number): string {
    const parts = [
        `${name}=${value}`,
        'path=/',
        `max-age=${maxAge}`,
        `SameSite=${process.env.NEXT_PUBLIC_AUTH_COOKIE_SAME_SITE ?? 'Lax'}`,
    ];
    const domain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN?.trim();

    if (domain) parts.push(`domain=${domain}`);
    if (
        process.env.NEXT_PUBLIC_AUTH_COOKIE_SECURE === 'true' ||
        process.env.NODE_ENV === 'production'
    ) {
        parts.push('Secure');
    }

    return parts.join('; ');
}

function writeSessionHintCookie(): void {
    if (typeof document === 'undefined') return;

    // Non-sensitive hint only. The server still owns real session validation.
    document.cookie = serializeClientCookie(
        SESSION_HINT_COOKIE,
        '1',
        parseDurationSeconds(
            process.env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN_TTL,
            DEFAULT_REFRESH_TOKEN_TTL,
        ),
    );
}

function writeReadableAuthTokenCookies(
    accessToken: string,
    refreshToken: string,
): void {
    if (typeof document === 'undefined') return;
    if (!shouldWriteReadableAuthCookies()) {
        writeSessionHintCookie();
        return;
    }

    // Development compatibility only. Production must use HttpOnly cookies set
    // by the auth service or a same-origin route handler.
    document.cookie = serializeClientCookie(
        ACCESS_COOKIE,
        accessToken,
        parseDurationSeconds(
            process.env.NEXT_PUBLIC_AUTH_ACCESS_TOKEN_TTL,
            DEFAULT_ACCESS_TOKEN_TTL,
        ),
    );
    document.cookie = serializeClientCookie(
        REFRESH_COOKIE,
        refreshToken,
        parseDurationSeconds(
            process.env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN_TTL,
            DEFAULT_REFRESH_TOKEN_TTL,
        ),
    );
    writeSessionHintCookie();
}

function clearClientAuthCookies(): void {
    if (typeof document === 'undefined') return;

    document.cookie = serializeClientCookie(ACCESS_COOKIE, '', 0);
    document.cookie = serializeClientCookie(REFRESH_COOKIE, '', 0);
    document.cookie = serializeClientCookie(SESSION_HINT_COOKIE, '', 0);
}

interface TokenResponse {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: 'full' | 'limited';
}

interface ErrorPayload {
    message?: string | string[];
    error?: string;
}

function readSessionValue(key: string): string | null {
    if (typeof window === 'undefined') return null;

    try {
        return sessionStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeSessionValue(key: string, value: string): void {
    if (typeof window === 'undefined') return;

    try {
        sessionStorage.setItem(key, value);
    } catch {
        // Session recovery should never fail a request because storage is unavailable.
    }
}

function applySessionCookies(accessToken: string, refreshToken: string): void {
    writeReadableAuthTokenCookies(accessToken, refreshToken);
}

function persistTokens(accessToken: string, refreshToken: string): void {
    writeSessionValue('av_at', accessToken);
    if (refreshToken) {
        writeSessionValue('av_rt', refreshToken);
    }
    applySessionCookies(accessToken, refreshToken);

    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require('@/lib/store/auth.store');
        useAuthStore.getState().setTokens(accessToken, refreshToken);
    } catch {
        // The API client can be used before the React tree is fully hydrated.
    }
}

function extractTokenResponse(response: unknown): TokenResponse {
    const payload = (response as { data?: unknown })?.data ?? response;
    return ((payload as { data?: TokenResponse })?.data ?? payload) as TokenResponse;
}

function getErrorText(error: AxiosError<ErrorPayload>): string {
    const payload = error.response?.data;
    const message = payload?.message;

    if (Array.isArray(message)) return message.join(' ');
    if (typeof message === 'string') return message;
    if (typeof payload?.error === 'string') return payload.error;

    return '';
}

export function getStoredAccessToken(): string | null {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require('@/lib/store/auth.store');
        const token = useAuthStore.getState().accessToken;
        if (token) return token;
    } catch {
        // Fall back to sessionStorage below.
    }

    return readSessionValue('av_at');
}

export function getStoredRefreshToken(): string | null {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require('@/lib/store/auth.store');
        const token = useAuthStore.getState().refreshToken;
        if (token) return token;
    } catch {
        // Fall back to sessionStorage below.
    }

    return readSessionValue('av_rt');
}

export function isIdentityVerificationError(error: AxiosError): boolean {
    if (error.response?.status !== 403) return false;

    const text = getErrorText(error as AxiosError<ErrorPayload>).toLowerCase();
    return text.includes('identity verification') || text.includes('limited token');
}

export async function refreshStoredSession(): Promise<string | null> {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken && typeof window !== 'undefined') {
        try {
            const response = await fetch('/api/refresh', {
                method: 'POST',
                credentials: 'include',
                cache: 'no-store',
            });

            if (!response.ok) return null;

            const tokens = extractTokenResponse(await response.json());
            if (!tokens.accessToken) return null;

            persistTokens(tokens.accessToken, tokens.refreshToken ?? '');
            return tokens.accessToken;
        } catch {
            return null;
        }
    }

    if (!refreshToken) return null;

    try {
        const response = await axios.post(`${AUTH_BASE}/auth/refresh`, {
            refreshToken,
        });
        const tokens = extractTokenResponse(response);

        if (!tokens.accessToken || !tokens.refreshToken) return null;

        persistTokens(tokens.accessToken, tokens.refreshToken);
        return tokens.accessToken;
    } catch {
        return null;
    }
}

export async function upgradeStoredSession(): Promise<string | null> {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await axios.post(`${AUTH_BASE}/auth/session/upgrade`, {
            refreshToken,
        });
        const tokens = extractTokenResponse(response);

        if (
            tokens.tokenType !== 'full' ||
            !tokens.accessToken ||
            !tokens.refreshToken
        ) {
            return null;
        }

        persistTokens(tokens.accessToken, tokens.refreshToken);
        return tokens.accessToken;
    } catch {
        return null;
    }
}

export function clearAuthAndRedirect(): void {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require('@/lib/store/auth.store');
        useAuthStore.getState().clearAuth();
    } catch {
        // Continue with direct storage cleanup.
    }

    if (typeof window === 'undefined') return;

    try {
        ['av_at', 'av_rt', 'av_user'].forEach((key) =>
            sessionStorage.removeItem(key),
        );
    } catch {
        // Ignore storage failures during logout cleanup.
    }

    clearClientAuthCookies();

    window.location.href = '/login';
}

export function redirectToIdentityVerification(): void {
    if (typeof window === 'undefined') return;

    const current = `${window.location.pathname}${window.location.search}`;
    if (window.location.pathname === '/verify-identity') return;

    window.location.href = `/verify-identity?next=${encodeURIComponent(current)}`;
}

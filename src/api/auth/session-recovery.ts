import axios, { AxiosError } from 'axios';

const AUTH_BASE =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

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
    if (typeof document === 'undefined') return;

    const maxAge = 60 * 60 * 24 * 30;
    document.cookie = `g360_at=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `g360_rt=${refreshToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
    document.cookie = `session_active=1; path=/; max-age=${maxAge}; SameSite=Strict`;
}

function persistTokens(accessToken: string, refreshToken: string): void {
    writeSessionValue('av_at', accessToken);
    writeSessionValue('av_rt', refreshToken);
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

    document.cookie =
        'session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'g360_at=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'g360_rt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    window.location.href = '/login';
}

export function redirectToIdentityVerification(): void {
    if (typeof window === 'undefined') return;

    const current = `${window.location.pathname}${window.location.search}`;
    if (window.location.pathname === '/verify-identity') return;

    window.location.href = `/verify-identity?next=${encodeURIComponent(current)}`;
}

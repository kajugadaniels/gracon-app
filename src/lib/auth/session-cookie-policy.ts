const DEFAULT_ACCESS_TOKEN_TTL = '15m';
const DEFAULT_REFRESH_TOKEN_TTL = '1d';
const DEFAULT_SESSION_HINT_COOKIE = 'session_active';
const DEFAULT_ACCESS_TOKEN_COOKIE = 'g360_at';
const DEFAULT_REFRESH_TOKEN_COOKIE = 'g360_rt';

type CookieSameSite = 'Strict' | 'Lax' | 'None';

function getPublicEnv(name: string): string | undefined {
    return process.env[name]?.trim() || undefined;
}

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

function normalizeSameSite(value: string | undefined): CookieSameSite {
    const normalized = value?.toLowerCase();
    if (normalized === 'strict') return 'Strict';
    if (normalized === 'none') return 'None';
    return 'Lax';
}

export const authCookiePolicy = {
    accessCookieName:
        getPublicEnv('NEXT_PUBLIC_AUTH_ACCESS_COOKIE_NAME') ?? DEFAULT_ACCESS_TOKEN_COOKIE,
    refreshCookieName:
        getPublicEnv('NEXT_PUBLIC_AUTH_REFRESH_COOKIE_NAME') ?? DEFAULT_REFRESH_TOKEN_COOKIE,
    sessionHintCookieName:
        getPublicEnv('NEXT_PUBLIC_AUTH_SESSION_HINT_COOKIE_NAME') ??
        DEFAULT_SESSION_HINT_COOKIE,
    cookieDomain: getPublicEnv('NEXT_PUBLIC_AUTH_COOKIE_DOMAIN'),
    cookieSameSite: normalizeSameSite(
        getPublicEnv('NEXT_PUBLIC_AUTH_COOKIE_SAME_SITE'),
    ),
    cookieSecure:
        getPublicEnv('NEXT_PUBLIC_AUTH_COOKIE_SECURE') === 'true' ||
        process.env.NODE_ENV === 'production',
    accessTokenMaxAgeSeconds: parseDurationSeconds(
        getPublicEnv('NEXT_PUBLIC_AUTH_ACCESS_TOKEN_TTL'),
        DEFAULT_ACCESS_TOKEN_TTL,
    ),
    refreshTokenMaxAgeSeconds: parseDurationSeconds(
        getPublicEnv('NEXT_PUBLIC_AUTH_REFRESH_TOKEN_TTL'),
        DEFAULT_REFRESH_TOKEN_TTL,
    ),
};

function shouldAllowReadableAuthTokenCookies(): boolean {
    const explicit = getPublicEnv('NEXT_PUBLIC_ALLOW_DEV_READABLE_AUTH_COOKIES');

    if (explicit === 'true') return true;
    if (explicit === 'false') return false;

    return process.env.NODE_ENV !== 'production';
}

function serializeCookie(
    name: string,
    value: string,
    options: {
        maxAge?: number;
        expires?: string;
        sameSite?: CookieSameSite;
    } = {},
): string {
    const parts = [
        `${name}=${value}`,
        'path=/',
        `SameSite=${options.sameSite ?? authCookiePolicy.cookieSameSite}`,
    ];

    if (typeof options.maxAge === 'number') {
        parts.push(`max-age=${options.maxAge}`);
    }
    if (options.expires) {
        parts.push(`expires=${options.expires}`);
    }
    if (authCookiePolicy.cookieDomain) {
        parts.push(`domain=${authCookiePolicy.cookieDomain}`);
    }
    if (authCookiePolicy.cookieSecure) {
        parts.push('Secure');
    }

    return parts.join('; ');
}

export function writeSessionHintCookie(): void {
    if (typeof document === 'undefined') return;

    // This cookie is intentionally non-sensitive. It is only a fast UI/middleware
    // hint that a server-owned session may exist; it is not an auth credential.
    document.cookie = serializeCookie(authCookiePolicy.sessionHintCookieName, '1', {
        maxAge: authCookiePolicy.refreshTokenMaxAgeSeconds,
    });
}

export function writeReadableAuthTokenCookies(
    accessToken: string,
    refreshToken: string,
): void {
    if (typeof document === 'undefined') return;
    if (!shouldAllowReadableAuthTokenCookies()) {
        writeSessionHintCookie();
        return;
    }

    // Development compatibility only. Production auth should be backed by
    // HttpOnly cookies set by the auth service or a same-origin BFF route.
    document.cookie = serializeCookie(authCookiePolicy.accessCookieName, accessToken, {
        maxAge: authCookiePolicy.accessTokenMaxAgeSeconds,
    });
    document.cookie = serializeCookie(authCookiePolicy.refreshCookieName, refreshToken, {
        maxAge: authCookiePolicy.refreshTokenMaxAgeSeconds,
    });
    writeSessionHintCookie();
}

export function clearClientAuthCookies(): void {
    if (typeof document === 'undefined') return;

    const expired = 'Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = serializeCookie(authCookiePolicy.accessCookieName, '', {
        expires: expired,
        maxAge: 0,
    });
    document.cookie = serializeCookie(authCookiePolicy.refreshCookieName, '', {
        expires: expired,
        maxAge: 0,
    });
    document.cookie = serializeCookie(authCookiePolicy.sessionHintCookieName, '', {
        expires: expired,
        maxAge: 0,
    });
}

export function hasSessionHintCookie(): boolean {
    if (typeof document === 'undefined') return false;

    return document.cookie
        .split(';')
        .some((part) => part.trim().startsWith(`${authCookiePolicy.sessionHintCookieName}=`));
}

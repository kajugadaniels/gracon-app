/**
 * Redirect safety helpers for app/app login and verification return flows.
 *
 * The identity app may receive `next` values from related Gracon apps. These
 * helpers only allow internal paths and exact allowlisted external origins, and
 * block session-ending routes from being reused as post-login destinations.
 */
const DEFAULT_INTERNAL_DESTINATION = '/dashboard';
const BLOCKED_INTERNAL_DESTINATIONS = new Set(['/logout']);

export type SafeLoginRedirect =
    | { kind: 'internal'; destination: string }
    | { kind: 'external'; destination: string };

function isSafeInternalPath(path: string): boolean {
    if (!path.startsWith('/')) return false;
    if (path.startsWith('//')) return false;

    try {
        const parsed = new URL(path, 'http://internal.gracon360.local');
        return parsed.origin === 'http://internal.gracon360.local';
    } catch {
        return false;
    }
}

function isBlockedInternalDestination(path: string): boolean {
    try {
        const parsed = new URL(path, 'http://internal.gracon360.local');
        return BLOCKED_INTERNAL_DESTINATIONS.has(parsed.pathname);
    } catch {
        return true;
    }
}

/**
 * Resolves a login `next` value into a safe in-app route or allowlisted
 * cross-app URL.
 */
export function resolveSafeLoginRedirect(
    next: string | null,
    docsBase: string,
    allowedOrigins: string[] = [],
): SafeLoginRedirect {
    if (!next) {
        return { kind: 'internal', destination: DEFAULT_INTERNAL_DESTINATION };
    }

    if (isSafeInternalPath(next)) {
        if (isBlockedInternalDestination(next)) {
            return { kind: 'internal', destination: DEFAULT_INTERNAL_DESTINATION };
        }

        return { kind: 'internal', destination: next };
    }

    try {
        const allowed = new Set([
            new URL(docsBase).origin,
            ...allowedOrigins.map((origin) => new URL(origin).origin),
        ]);
        const targetUrl = new URL(next);

        if (allowed.has(targetUrl.origin)) {
            return { kind: 'external', destination: targetUrl.toString() };
        }
    } catch {
        // Fall through to the dashboard for malformed or non-http URLs.
    }

    return { kind: 'internal', destination: DEFAULT_INTERNAL_DESTINATION };
}

/**
 * Parses comma-separated exact origins that may receive login return redirects.
 */
export function parseAllowedRedirectOrigins(value: string | undefined): string[] {
    if (!value) return [];

    return value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}

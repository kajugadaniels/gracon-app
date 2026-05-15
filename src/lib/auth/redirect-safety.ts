const DEFAULT_INTERNAL_DESTINATION = '/dashboard';

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

export function resolveSafeLoginRedirect(
    next: string | null,
    docsBase: string,
    allowedOrigins: string[] = [],
): SafeLoginRedirect {
    if (!next) {
        return { kind: 'internal', destination: DEFAULT_INTERNAL_DESTINATION };
    }

    if (isSafeInternalPath(next)) {
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

export function parseAllowedRedirectOrigins(value: string | undefined): string[] {
    if (!value) return [];

    return value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}

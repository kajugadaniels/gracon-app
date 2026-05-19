/**
 * Main-app verification routing helpers.
 */

export type VerificationRedirect =
    | { kind: 'internal'; destination: '/dashboard' }
    | { kind: 'external'; destination: string };

/**
 * Resolves where the auth app should send the user after verification.
 */
export function resolveMainAppVerificationRedirect(
    next: string | null,
    docsBase: string,
    allowedOrigins: string[] = [],
): VerificationRedirect {
    if (!next) {
        return { kind: 'internal', destination: '/dashboard' };
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
        // Fall through to the local dashboard when the target is invalid.
    }

    return { kind: 'internal', destination: '/dashboard' };
}

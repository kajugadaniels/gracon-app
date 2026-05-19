/**
 * Main-app verification routing helpers.
 */

export type VerificationRedirect =
    | { kind: 'internal'; destination: '/dashboard' }
    | { kind: 'external'; destination: string };

const BLOCKED_EXTERNAL_PATHS = new Set(['/logout']);

/**
 * Rejects cross-app routes that would immediately destroy the user's session
 * after verification. This keeps `next` useful without letting a forged link
 * turn a successful verification into a confusing logout loop.
 */
function isBlockedExternalDestination(url: URL): boolean {
    return BLOCKED_EXTERNAL_PATHS.has(url.pathname);
}

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

        if (allowed.has(targetUrl.origin) && !isBlockedExternalDestination(targetUrl)) {
            return { kind: 'external', destination: targetUrl.toString() };
        }
    } catch {
        // Fall through to the local dashboard when the target is invalid.
    }

    return { kind: 'internal', destination: '/dashboard' };
}

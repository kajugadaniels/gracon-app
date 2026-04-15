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
): VerificationRedirect {
    if (!next) {
        return { kind: 'internal', destination: '/dashboard' };
    }

    try {
        const docsUrl = new URL(docsBase);
        const targetUrl = new URL(next);

        if (targetUrl.origin === docsUrl.origin) {
            return { kind: 'external', destination: targetUrl.toString() };
        }
    } catch {
        // Fall through to the local dashboard when the target is invalid.
    }

    return { kind: 'internal', destination: '/dashboard' };
}

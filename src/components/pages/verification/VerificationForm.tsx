'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useVerificationDocumentNumber } from './shared';
import { VerificationFlow } from './VerificationFlow';
import { createVerificationFlowConfig } from './verification-flow-config';
import { resolveMainAppVerificationRedirect } from './verification-routing';
import { useVerificationFlow } from './use-verification-flow';
import { toast } from '@/components/ui';
import { parseAllowedRedirectOrigins } from '@/lib/auth/redirect-safety';
import { useAuthStore } from '@/lib/store/auth.store';

// ── Main component ────────────────────────────────────────────

export function VerificationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const challengeMode =
        searchParams.get('challenge') === 'invitation'
            ? 'INVITATION'
            : 'STANDARD';
    const shouldReturnToLogin =
        searchParams.get('source') === 'onboarding' ||
        searchParams.get('next') === '/login';
    const config = createVerificationFlowConfig(
        challengeMode,
        shouldReturnToLogin ? 'login' : 'dashboard',
    );
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const controller = useVerificationFlow({
        challengeMode: config.challengeMode,
        getSuccessDescription: config.getSuccessDescription,
        returnToLoginAfterPass: shouldReturnToLogin,
    });
    const documentNumberState = useVerificationDocumentNumber({
        onConfirm: controller.confirmDocumentNumber,
        onInvalidLength: (message) => {
            toast.error('Invalid National ID', { description: message });
        },
    });

    function continueAfterVerification() {
        if (shouldReturnToLogin) {
            clearAuth();
            window.location.replace('/login');
            return;
        }

        const docsBase = process.env.NEXT_PUBLIC_DOCS_URL ?? 'http://localhost:4002';
        const redirect = resolveMainAppVerificationRedirect(
            searchParams.get('next'),
            docsBase,
            parseAllowedRedirectOrigins(
                process.env.NEXT_PUBLIC_AUTH_ALLOWED_REDIRECT_ORIGINS,
            ),
        );

        if (redirect.kind === 'external') {
            window.location.href = redirect.destination;
            return;
        }

        router.push(redirect.destination);
    }

    // ── Render by step ────────────────────────────────────────────

    return (
        <VerificationFlow
            config={config}
            controller={controller}
            documentNumber={documentNumberState.documentNumber}
            documentNumberError={documentNumberState.documentNumberError}
            onDocumentNumberChange={documentNumberState.setDocumentNumber}
            onNidSubmit={documentNumberState.submitDocumentNumber}
            onContinue={continueAfterVerification}
            onDashboard={() => router.push('/dashboard')}
        />
    );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useVerificationDocumentNumber } from '@gracon/verification-ui';
import { VerificationFlow } from './VerificationFlow';
import { createVerificationFlowConfig } from './verification-flow-config';
import { resolveMainAppVerificationRedirect } from './verification-routing';
import { useVerificationFlow } from './use-verification-flow';
import { toast } from '@/components/ui';

// ── Main component ────────────────────────────────────────────

export function VerificationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const challengeMode =
        searchParams.get('challenge') === 'invitation'
            ? 'INVITATION'
            : 'STANDARD';
    const config = createVerificationFlowConfig(challengeMode);
    const controller = useVerificationFlow({
        challengeMode: config.challengeMode,
        getSuccessDescription: config.getSuccessDescription,
    });
    const documentNumberState = useVerificationDocumentNumber({
        onConfirm: controller.confirmDocumentNumber,
        onInvalidLength: (message) => {
            toast.error('Invalid National ID', { description: message });
        },
    });

    function continueAfterVerification() {
        const docsBase = process.env.NEXT_PUBLIC_DOCS_URL ?? 'http://localhost:4002';
        const redirect = resolveMainAppVerificationRedirect(
            searchParams.get('next'),
            docsBase,
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

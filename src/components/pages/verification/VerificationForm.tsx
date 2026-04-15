'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VerificationFlow } from './VerificationFlow';
import { createVerificationFlowConfig } from './verification-flow-config';
import { useVerificationFlow } from './use-verification-flow';
import { toast } from '@/components/ui';

// ── Main component ────────────────────────────────────────────

export function VerificationForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [documentNumber, setDocumentNumber] = useState('');
    const [documentNumberError, setDocumentNumberError] = useState<string>();
    const challengeMode =
        searchParams.get('challenge') === 'invitation'
            ? 'INVITATION'
            : 'STANDARD';
    const config = createVerificationFlowConfig(challengeMode);
    const controller = useVerificationFlow({
        challengeMode: config.challengeMode,
        getSuccessDescription: config.getSuccessDescription,
    });

    function continueAfterVerification() {
        const next = searchParams.get('next');

        if (!next) {
            router.push('/dashboard');
            return;
        }

        const docsBase = process.env.NEXT_PUBLIC_DOCS_URL ?? 'http://localhost:4002';

        try {
            const docsUrl = new URL(docsBase);
            const targetUrl = new URL(next);

            if (targetUrl.origin === docsUrl.origin) {
                window.location.href = targetUrl.toString();
                return;
            }
        } catch {
            // Fall back to dashboard when next is not a safe absolute URL.
        }

        router.push('/dashboard');
    }

    // ── Handlers ──────────────────────────────────────────────────

    function handleNidSubmit() {
        if (documentNumber.length !== 16) {
            const message = 'National ID must be exactly 16 digits';
            setDocumentNumberError(message);
            toast.error('Invalid National ID', { description: message });
            return;
        }

        setDocumentNumberError(undefined);
        controller.confirmDocumentNumber(documentNumber);
    }

    // ── Render by step ────────────────────────────────────────────

    return (
        <VerificationFlow
            config={config}
            controller={controller}
            documentNumber={documentNumber}
            documentNumberError={documentNumberError}
            onDocumentNumberChange={(value) => {
                setDocumentNumber(value);
                if (documentNumberError) {
                    setDocumentNumberError(undefined);
                }
            }}
            onNidSubmit={handleNidSubmit}
            onContinue={continueAfterVerification}
            onDashboard={() => router.push('/dashboard')}
        />
    );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { VerificationFlow } from './VerificationFlow';
import { createVerificationFlowConfig } from './verification-flow-config';
import { useVerificationFlow } from './use-verification-flow';

// ── Validation schema ─────────────────────────────────────────

const schema = z.object({
    documentNumber: z
        .string()
        .length(16, 'National ID must be exactly 16 digits')
        .regex(/^\d{16}$/, 'Must contain only digits'),
});

type FormFields = z.infer<typeof schema>;

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

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({ resolver: zodResolver(schema) });

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

    const handleNidSubmit = (values: FormFields) => {
        controller.confirmDocumentNumber(values.documentNumber);
    };

    // ── Render by step ────────────────────────────────────────────

    return (
        <VerificationFlow
            config={config}
            controller={controller}
            register={register}
            handleSubmit={handleSubmit}
            documentNumberError={errors.documentNumber?.message}
            onNidSubmit={handleNidSubmit}
            onContinue={continueAfterVerification}
            onDashboard={() => router.push('/dashboard')}
        />
    );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui';
import { VerificationCaptureStep } from './VerificationCaptureStep';
import { VerificationIdentityStep } from './VerificationIdentityStep';
import { VerificationResultPanel } from './VerificationResultPanel';
import { VerificationStepProgress } from './VerificationStepProgress';
import {
    useVerificationFlow,
} from './use-verification-flow';

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
    const isInvitationChallenge = searchParams.get('challenge') === 'invitation';
    const {
        step,
        idCaptured,
        selfieCaptured,
        idCardPreview,
        selfiePreview,
        result,
        loading,
        confirmDocumentNumber,
        captureIdCard,
        captureSelfie,
        retakeIdCard,
        retakeSelfie,
        setStep,
        resetForRetry,
        submitVerification,
    } = useVerificationFlow(isInvitationChallenge);

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
        confirmDocumentNumber(values.documentNumber);
    };

    // ── Render by step ────────────────────────────────────────────

    return (
        <Card strength="strong" style={{ width: '100%', maxWidth: 560 }}>
            <div className="animate-fade-up">
                <VerificationStepProgress current={step} />

                {step === 'nid' && (
                    <VerificationIdentityStep
                        isInvitationChallenge={isInvitationChallenge}
                        error={errors.documentNumber?.message}
                        register={register}
                        handleSubmit={handleSubmit}
                        onSubmit={handleNidSubmit}
                    />
                )}

                {step === 'id-card' && (
                    <VerificationCaptureStep
                        title="Photograph your ID card"
                        description="Hold your physical ID card in front of the back camera. Align it within the dashed border and ensure all text is readable."
                        mode="id-card"
                        captured={idCaptured}
                        backLabel="Back"
                        continueLabel="Continue to selfie"
                        disabledLabel="Capture ID card first"
                        onCapture={captureIdCard}
                        onRetake={retakeIdCard}
                        onBack={() => setStep('nid')}
                        onContinue={() => setStep('selfie')}
                    />
                )}

                {step === 'selfie' && (
                    <VerificationCaptureStep
                        title="Take a selfie"
                        description="Look directly at the front camera. Position your face within the oval guide. Remove glasses if possible for the best result."
                        mode="selfie"
                        captured={selfieCaptured}
                        loading={loading}
                        loadingText="Verifying..."
                        backLabel="Back"
                        continueLabel="Submit for verification"
                        disabledLabel="Capture selfie first"
                        onCapture={captureSelfie}
                        onRetake={retakeSelfie}
                        onBack={() => setStep('id-card')}
                        onContinue={submitVerification}
                    />
                )}

                {step === 'result' && result && (
                    <VerificationResultPanel
                        result={result}
                        idCardPreview={idCardPreview}
                        selfiePreview={selfiePreview}
                        isInvitationChallenge={isInvitationChallenge}
                        onContinue={continueAfterVerification}
                        onRetry={resetForRetry}
                        onDashboard={() => router.push('/dashboard')}
                    />
                )}
            </div>
        </Card>
    );
}

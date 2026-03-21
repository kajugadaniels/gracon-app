'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, StatusBadge } from '@/components/ui';
import { DocumentUpload } from './DocumentUpload';
import { ScoreRing } from './ScoreRing';
import { submitVerificationApi, type VerificationResult } from '@/api/verification/submit-verification.api';
import { useApi } from '@/lib/hooks/useApi';
import { useAuthStore } from '@/lib/store/auth.store';

// ── Validation schema ─────────────────────────────────────────

const schema = z.object({
    documentNumber: z
        .string()
        .length(16, 'National ID must be exactly 16 digits')
        .regex(/^\d{16}$/, 'Must contain only digits'),
});

type FormFields = z.infer<typeof schema>;

// ── Sub-components ────────────────────────────────────────────

// Individual score bar for the breakdown section
function ScoreBar({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    {label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color }}>
                    {Math.round(value)}%
                </span>
            </div>
            <div
                style={{
                    height: 6,
                    borderRadius: 3,
                    background: 'rgba(91,35,255,0.10)',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${value}%`,
                        background: color,
                        borderRadius: 3,
                        transition: 'width 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                />
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────

export function VerificationForm() {
    const router = useRouter();
    const { user, setUser } = useAuthStore();

    const [idCard, setIdCard] = useState<File | null>(null);
    const [selfie, setSelfie] = useState<File | null>(null);
    const [idError, setIdError] = useState<string>('');
    const [selfieError, setSelfieError] = useState<string>('');
    const [result, setResult] = useState<VerificationResult | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({ resolver: zodResolver(schema) });

    const { execute: submit, loading, error: apiError } = useApi(
        submitVerificationApi,
        {
            onSuccess: (res) => {
                const result = res.data ?? res;
                setResult(result);

                if (result.passed) {
                    // Update user store — fully verified now
                    if (user) setUser({ ...user, isIdVerified: true });

                    // Upgrade tokens — replace limited token with full token
                    if (result.upgradedTokens) {
                        setTokens(
                            result.upgradedTokens.accessToken,
                            result.upgradedTokens.refreshToken,
                        );
                    }
                }
            },
        },
    );

    const onSubmit = async (values: FormFields) => {
        // Validate files before calling API
        let hasError = false;

        if (!idCard) {
            setIdError('Please upload a photo of your ID card');
            hasError = true;
        } else {
            setIdError('');
        }

        if (!selfie) {
            setSelfieError('Please upload a selfie photo');
            hasError = true;
        } else {
            setSelfieError('');
        }

        if (hasError) return;

        await submit(values.documentNumber, idCard!, selfie!);
    };

    // ── Result screen
    if (result) {
        const scoreColor = result.passed
            ? 'var(--color-success)'
            : result.compositeScore >= 60
                ? 'var(--color-warning)'
                : 'var(--color-error)';

        return (
            <Card
                strength="strong"
                style={{ width: '100%', maxWidth: 500 }}
            >
                <div
                    className="animate-fade-up"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 24,
                    }}
                >
                    {/* Status badge */}
                    <StatusBadge
                        status={result.passed ? 'verified' : 'failed'}
                        label={result.passed ? 'Verification passed' : 'Verification failed'}
                        pulse={result.passed}
                    />

                    {/* Score ring */}
                    <ScoreRing
                        score={result.compositeScore}
                        passed={result.passed}
                        size={148}
                    />

                    {/* Score breakdown */}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <h3
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--color-text-secondary)',
                                margin: 0,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}
                        >
                            Score breakdown
                        </h3>

                        <ScoreBar
                            label="Face similarity"
                            value={result.faceScore}
                            color="#7c3aed"
                        />
                        <ScoreBar
                            label="Liveness confidence"
                            value={result.livenessScore}
                            color="var(--color-primary)"
                        />

                        {/* Document match — binary indicator */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                Document number match
                            </span>
                            <StatusBadge
                                status={result.documentMatch ? 'verified' : 'failed'}
                                label={result.documentMatch ? 'Matched' : 'Not matched'}
                            />
                        </div>
                    </div>

                    {/* Fail reason */}
                    {!result.passed && result.failReason && (
                        <div
                            className="animate-scale-in"
                            style={{
                                width: '100%',
                                background: 'var(--color-error-subtle)',
                                border: '1px solid var(--color-error-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '10px 14px',
                                fontSize: 13,
                                color: 'var(--color-error)',
                                lineHeight: 1.6,
                            }}
                        >
                            {result.failReason}
                        </div>
                    )}

                    {/* Attempts remaining */}
                    {!result.passed && (
                        <p
                            style={{
                                fontSize: 12,
                                color: 'var(--color-text-muted)',
                                textAlign: 'center',
                                margin: 0,
                            }}
                        >
                            {result.attemptsRemaining > 0
                                ? `${result.attemptsRemaining} attempt(s) remaining today`
                                : 'No attempts remaining. Please contact support.'}
                        </p>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                        {result.passed ? (
                            <Button fullWidth onClick={() => router.push('/dashboard')}>
                                Go to dashboard
                            </Button>
                        ) : result.attemptsRemaining > 0 ? (
                            <>
                                <Button
                                    variant="ghost"
                                    style={{ flex: 1 }}
                                    onClick={() => setResult(null)}
                                >
                                    Try again
                                </Button>
                                <Button
                                    style={{ flex: 1 }}
                                    onClick={() => router.push('/dashboard')}
                                >
                                    Dashboard
                                </Button>
                            </>
                        ) : (
                            <Button
                                fullWidth
                                variant="ghost"
                                onClick={() => router.push('/dashboard')}
                            >
                                Return to dashboard
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        );
    }

    // ── Submission form
    return (
        <Card strength="strong" style={{ width: '100%', maxWidth: 520 }}>
            <div className="animate-fade-up">
                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <h1
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: 6,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Identity verification
                    </h1>
                    <p
                        style={{
                            fontSize: 14,
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.6,
                            margin: 0,
                        }}
                    >
                        Upload your ID card and a selfie. We&apos;ll compare them to confirm
                        your identity.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                    noValidate
                >
                    {/* NID confirmation */}
                    <Input
                        label="Confirm your National ID number"
                        placeholder="Enter your 16-digit NID"
                        maxLength={16}
                        inputMode="numeric"
                        autoComplete="off"
                        required
                        hint="Must match the ID you registered with"
                        error={errors.documentNumber?.message}
                        {...register('documentNumber')}
                    />

                    {/* Uploads side by side */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 14,
                        }}
                    >
                        <DocumentUpload
                            label="ID card photo"
                            hint="Front of your national ID — clear, well-lit"
                            file={idCard}
                            onChange={setIdCard}
                            error={idError}
                            disabled={loading}
                        />
                        <DocumentUpload
                            label="Your selfie"
                            hint="Face clearly visible, looking at camera"
                            file={selfie}
                            onChange={setSelfie}
                            error={selfieError}
                            disabled={loading}
                        />
                    </div>

                    {/* Tips */}
                    <div
                        style={{
                            background: 'var(--color-bg-elevated)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 5,
                        }}
                    >
                        {[
                            'Ensure your full face is clearly visible in the selfie',
                            'ID card must be unobstructed — no fingers covering the photo',
                            'Good lighting significantly improves accuracy',
                        ].map((tip) => (
                            <div
                                key={tip}
                                style={{
                                    display: 'flex',
                                    gap: 8,
                                    alignItems: 'flex-start',
                                    fontSize: 12,
                                    color: 'var(--color-text-muted)',
                                    lineHeight: 1.5,
                                }}
                            >
                                <span
                                    style={{
                                        color: 'var(--color-primary)',
                                        flexShrink: 0,
                                        marginTop: 1,
                                        fontWeight: 700,
                                    }}
                                >
                                    •
                                </span>
                                {tip}
                            </div>
                        ))}
                    </div>

                    {/* API error */}
                    {apiError && (
                        <div
                            role="alert"
                            className="animate-scale-in"
                            style={{
                                background: 'var(--color-error-subtle)',
                                border: '1px solid var(--color-error-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '10px 14px',
                                fontSize: 13,
                                color: 'var(--color-error)',
                            }}
                        >
                            {apiError}
                        </div>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                        loadingVariant="pulse"
                        loadingText="Verifying your identity..."
                        size="lg"
                    >
                        Verify my identity
                    </Button>
                </form>
            </div>
        </Card>
    );
}
function setTokens(accessToken: string, refreshToken: string) {
    throw new Error('Function not implemented.');
}


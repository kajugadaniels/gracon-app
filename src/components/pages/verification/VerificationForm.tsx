'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, StatusBadge } from '@/components/ui';
import { toast } from '@/components/ui';
import { CameraCapture } from './CameraCapture';
import { ScoreRing } from './ScoreRing';
import {
    submitVerificationApi,
    type VerificationResult,
} from '@/api/verification/submit-verification.api';
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

// ── Step definitions ──────────────────────────────────────────

type VerifyStep = 'nid' | 'id-card' | 'selfie' | 'result';

const STEPS: { key: VerifyStep; label: string }[] = [
    { key: 'nid', label: 'Confirm ID' },
    { key: 'id-card', label: 'ID Card' },
    { key: 'selfie', label: 'Selfie' },
    { key: 'result', label: 'Result' },
];

// ── Step progress indicator ───────────────────────────────────

function StepProgress({ current }: { current: VerifyStep }) {
    const currentIndex = STEPS.findIndex((s) => s.key === current);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
                marginBottom: 32,
                width: '100%',
            }}
        >
            {STEPS.map((step, i) => {
                const isDone = i < currentIndex;
                const isActive = i === currentIndex;
                const isLast = i === STEPS.length - 1;

                return (
                    <div
                        key={step.key}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            flex: isLast ? 0 : 1,
                        }}
                    >
                        {/* Circle */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 4,
                            }}
                        >
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background:
                                        isDone
                                            ? 'var(--color-success)'
                                            : isActive
                                                ? 'var(--color-primary)'
                                                : 'rgba(255,255,255,0.08)',
                                    border:
                                        isActive
                                            ? '2px solid var(--color-primary)'
                                            : isDone
                                                ? '2px solid var(--color-success)'
                                                : '2px solid rgba(255,255,255,0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color:
                                        isDone || isActive ? '#fff' : 'var(--color-text-muted)',
                                    transition: 'all 300ms ease',
                                    flexShrink: 0,
                                }}
                            >
                                {isDone ? '✓' : i + 1}
                            </div>
                            <span
                                style={{
                                    fontSize: 10,
                                    fontWeight: 500,
                                    color:
                                        isActive
                                            ? 'var(--color-text-primary)'
                                            : isDone
                                                ? 'var(--color-success)'
                                                : 'var(--color-text-muted)',
                                    whiteSpace: 'nowrap',
                                    transition: 'color 300ms ease',
                                }}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {!isLast && (
                            <div
                                style={{
                                    flex: 1,
                                    height: 2,
                                    marginBottom: 18,
                                    background:
                                        isDone
                                            ? 'var(--color-success)'
                                            : 'rgba(255,255,255,0.08)',
                                    transition: 'background 300ms ease',
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Score breakdown bar ───────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color }}>{Math.round(value)}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
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
    const { user, setUser, setTokens } = useAuthStore();

    const [step, setStep] = useState<VerifyStep>('nid');
    const [documentNumber, setDocumentNumber] = useState('');
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [idCaptured, setIdCaptured] = useState(false);
    const [selfieCaptured, setSelfieCaptured] = useState(false);
    const [result, setResult] = useState<VerificationResult | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({ resolver: zodResolver(schema) });

    const { execute: submit, loading } = useApi(submitVerificationApi, {
        showErrorToast: true,
        onSuccess: (res) => {
            const data = res.data ?? res;
            setResult(data);
            setStep('result');

            if (data.passed) {
                if (user) setUser({ ...user, isIdVerified: true });
                if (data.upgradedTokens) {
                    setTokens(
                        data.upgradedTokens.accessToken,
                        data.upgradedTokens.refreshToken,
                    );
                }
                toast.success('Identity verified!', {
                    description: `Score: ${Math.round(data.compositeScore)}% — you can now access your dashboard.`,
                });
            } else {
                toast.error('Verification failed', {
                    description: data.failReason ?? 'Please try again with better lighting.',
                });
            }
        },
    });

    // ── Handlers ──────────────────────────────────────────────────

    const handleNidSubmit = (values: FormFields) => {
        setDocumentNumber(values.documentNumber);
        setStep('id-card');
    };

    const handleIdCardCapture = (dataUrl: string, file: File) => {
        setIdCardFile(file);
        setIdCaptured(true);
    };

    const handleSelfieCapture = (dataUrl: string, file: File) => {
        setSelfieFile(file);
        setSelfieCaptured(true);
    };

    const handleIdCardRetake = () => {
        setIdCardFile(null);
        setIdCaptured(false);
    };

    const handleSelfieRetake = () => {
        setSelfieFile(null);
        setSelfieCaptured(false);
    };

    const handleSubmitVerification = async () => {
        if (!idCardFile || !selfieFile) {
            toast.error('Missing photos', {
                description: 'Please capture both your ID card and selfie.',
            });
            return;
        }
        await submit(documentNumber, idCardFile, selfieFile);
    };

    // ── Render by step ────────────────────────────────────────────

    return (
        <Card strength="strong" style={{ width: '100%', maxWidth: 560 }}>
            <div className="animate-fade-up">

                {/* Step progress */}
                <StepProgress current={step} />

                {/* ── Step 1: Confirm NID ── */}
                {step === 'nid' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div>
                            <h1
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: 'var(--color-text-primary)',
                                    marginBottom: 8,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                Confirm your ID number
                            </h1>
                            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                Enter your 16-digit National ID number to begin. We&apos;ll compare it
                                against the one you registered with.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit(handleNidSubmit)}
                            style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                            noValidate
                        >
                            <Input
                                label="National ID number"
                                placeholder="Enter your 16-digit NID"
                                maxLength={16}
                                inputMode="numeric"
                                autoComplete="off"
                                required
                                hint="This must match the ID you used when registering"
                                error={errors.documentNumber?.message}
                                {...register('documentNumber')}
                            />

                            <Button type="submit" fullWidth size="lg">
                                Continue
                            </Button>
                        </form>
                    </div>
                )}

                {/* ── Step 2: Capture ID card ── */}
                {step === 'id-card' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <h1
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: 'var(--color-text-primary)',
                                    marginBottom: 8,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                Photograph your ID card
                            </h1>
                            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                Hold your physical ID card in front of the back camera. Align it
                                within the dashed border and ensure all text is readable.
                            </p>
                        </div>

                        <CameraCapture
                            mode="id-card"
                            onCapture={handleIdCardCapture}
                            onRetake={handleIdCardRetake}
                            captured={idCaptured}
                        />

                        <div style={{ display: 'flex', gap: 12 }}>
                            <Button
                                variant="ghost"
                                onClick={() => setStep('nid')}
                                style={{ flex: 1 }}
                            >
                                Back
                            </Button>
                            <Button
                                disabled={!idCaptured}
                                onClick={() => setStep('selfie')}
                                style={{ flex: 2 }}
                            >
                                {idCaptured ? 'Continue to selfie' : 'Capture ID card first'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Capture selfie ── */}
                {step === 'selfie' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <h1
                                style={{
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: 'var(--color-text-primary)',
                                    marginBottom: 8,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                Take a selfie
                            </h1>
                            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                                Look directly at the front camera. Position your face within the oval
                                guide. Remove glasses if possible for the best result.
                            </p>
                        </div>

                        <CameraCapture
                            mode="selfie"
                            onCapture={handleSelfieCapture}
                            onRetake={handleSelfieRetake}
                            captured={selfieCaptured}
                        />

                        <div style={{ display: 'flex', gap: 12 }}>
                            <Button
                                variant="ghost"
                                onClick={() => setStep('id-card')}
                                style={{ flex: 1 }}
                            >
                                Back
                            </Button>
                            <Button
                                disabled={!selfieCaptured || loading}
                                loading={loading}
                                loadingVariant="pulse"
                                loadingText="Verifying..."
                                onClick={handleSubmitVerification}
                                style={{ flex: 2 }}
                            >
                                {selfieCaptured ? 'Submit for verification' : 'Capture selfie first'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Step 4: Result ── */}
                {step === 'result' && result && (
                    <div
                        className="animate-fade-up"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 24,
                        }}
                    >
                        <StatusBadge
                            status={result.passed ? 'verified' : 'failed'}
                            label={result.passed ? 'Verification passed' : 'Verification failed'}
                            pulse={result.passed}
                        />

                        <ScoreRing
                            score={result.compositeScore}
                            passed={result.passed}
                            size={160}
                        />

                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>
                                Score breakdown
                            </h3>
                            <ScoreBar label="Face similarity" value={result.faceScore} color="#60a5fa" />
                            <ScoreBar label="Liveness confidence" value={result.livenessScore} color="#a78bfa" />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                                    Document number
                                </span>
                                <StatusBadge
                                    status={result.documentMatch ? 'verified' : 'failed'}
                                    label={result.documentMatch ? 'Matched' : 'Not matched'}
                                />
                            </div>
                        </div>

                        {!result.passed && result.failReason && (
                            <div
                                style={{
                                    width: '100%',
                                    background: 'var(--color-error-subtle)',
                                    border: '1px solid var(--color-error-border)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '12px 16px',
                                    fontSize: 13,
                                    color: 'var(--color-error)',
                                    lineHeight: 1.6,
                                }}
                            >
                                {result.failReason}
                            </div>
                        )}

                        {!result.passed && result.attemptsRemaining > 0 && (
                            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
                                {result.attemptsRemaining} attempt(s) remaining today
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                            {result.passed ? (
                                <Button fullWidth onClick={() => router.push('/dashboard')}>
                                    Go to dashboard
                                </Button>
                            ) : result.attemptsRemaining > 0 ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        style={{ flex: 1 }}
                                        onClick={() => {
                                            setIdCaptured(false);
                                            setSelfieFile(null);
                                            setIdCardFile(null);
                                            setSelfieCaptured(false);
                                            setResult(null);
                                            setStep('nid');
                                        }}
                                    >
                                        Try again
                                    </Button>
                                    <Button style={{ flex: 1 }} onClick={() => router.push('/dashboard')}>
                                        Dashboard
                                    </Button>
                                </>
                            ) : (
                                <Button fullWidth variant="ghost" onClick={() => router.push('/dashboard')}>
                                    Return to dashboard
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
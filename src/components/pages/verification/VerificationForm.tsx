'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
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
    const searchParams = useSearchParams();
    const { user, setUser, setTokens } = useAuthStore();

    const [step, setStep] = useState<VerifyStep>('nid');
    const [documentNumber, setDocumentNumber] = useState('');
    const [idCardFile, setIdCardFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
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
        setDocumentNumber(values.documentNumber);
        setStep('id-card');
    };

    const handleIdCardCapture = (dataUrl: string, file: File) => {
        setIdCardFile(file);
        setIdCardPreview(dataUrl);
        setIdCaptured(true);
    };

    const handleSelfieCapture = (dataUrl: string, file: File) => {
        setSelfieFile(file);
        setSelfiePreview(dataUrl);
        setSelfieCaptured(true);
    };

    const handleIdCardRetake = () => {
        setIdCardFile(null);
        setIdCardPreview(null);
        setIdCaptured(false);
    };

    const handleSelfieRetake = () => {
        setSelfieFile(null);
        setSelfiePreview(null);
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
                        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                    >
                        {/* Status badge */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <StatusBadge
                                status={result.passed ? 'verified' : 'failed'}
                                label={result.passed ? 'Identity verified' : 'Verification failed'}
                                pulse={result.passed}
                            />
                        </div>

                        {/* Photo previews — ID card + selfie side by side */}
                        {(idCardPreview || selfiePreview) && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {/* ID card photo */}
                                {idCardPreview && (
                                    <div
                                        style={{
                                            position: 'relative',
                                            borderRadius: 12,
                                            overflow: 'hidden',
                                            border: `1.5px solid ${result.documentMatch ? 'rgba(5,150,105,0.35)' : 'rgba(220,38,38,0.35)'}`,
                                            height: 130,
                                            background: '#000',
                                        }}
                                    >
                                        <img
                                            src={idCardPreview}
                                            alt="ID card"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }}
                                        />
                                        {/* Bottom label */}
                                        <div
                                            style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                                background: 'linear-gradient(transparent, rgba(0,0,0,0.72))',
                                                padding: '20px 8px 7px',
                                                fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
                                                letterSpacing: '0.06em', textTransform: 'uppercase',
                                            }}
                                        >
                                            ID Card
                                        </div>
                                        {/* Match badge */}
                                        <div
                                            style={{
                                                position: 'absolute', top: 7, right: 7,
                                                background: result.documentMatch ? 'rgba(5,150,105,0.88)' : 'rgba(220,38,38,0.88)',
                                                color: '#fff', fontSize: 10, fontWeight: 700,
                                                padding: '2px 7px', borderRadius: 999,
                                                backdropFilter: 'blur(6px)',
                                            }}
                                        >
                                            {result.documentMatch ? '✓ Matched' : '✗ No match'}
                                        </div>
                                    </div>
                                )}

                                {/* Selfie photo */}
                                {selfiePreview && (
                                    <div
                                        style={{
                                            position: 'relative',
                                            borderRadius: 12,
                                            overflow: 'hidden',
                                            border: `1.5px solid ${result.faceScore >= 70 ? 'rgba(96,165,250,0.40)' : 'rgba(220,38,38,0.35)'}`,
                                            height: 130,
                                            background: '#000',
                                        }}
                                    >
                                        <img
                                            src={selfiePreview}
                                            alt="Selfie"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', opacity: 0.92 }}
                                        />
                                        {/* Bottom label */}
                                        <div
                                            style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                                background: 'linear-gradient(transparent, rgba(0,0,0,0.72))',
                                                padding: '20px 8px 7px',
                                                fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)',
                                                letterSpacing: '0.06em', textTransform: 'uppercase',
                                            }}
                                        >
                                            Selfie
                                        </div>
                                        {/* Face score badge */}
                                        <div
                                            style={{
                                                position: 'absolute', top: 7, right: 7,
                                                background: result.faceScore >= 70 ? 'rgba(59,130,246,0.88)' : 'rgba(220,38,38,0.88)',
                                                color: '#fff', fontSize: 10, fontWeight: 700,
                                                padding: '2px 7px', borderRadius: 999,
                                                backdropFilter: 'blur(6px)',
                                            }}
                                        >
                                            {Math.round(result.faceScore)}% face
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Identity info card */}
                        {result.idInfo && (
                            <div
                                style={{
                                    background: 'rgba(91,35,255,0.05)',
                                    border: '1px solid rgba(91,35,255,0.14)',
                                    borderRadius: 14,
                                    padding: '14px 16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12,
                                }}
                            >
                                {/* Section title */}
                                <div
                                    style={{
                                        fontSize: 10, fontWeight: 700,
                                        letterSpacing: '0.09em', textTransform: 'uppercase',
                                        color: 'var(--color-text-muted)',
                                        display: 'flex', alignItems: 'center', gap: 6,
                                    }}
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                                        <path d="M7 9h4M7 13h6M15 13h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                        <circle cx="16.5" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    Identity Details
                                </div>

                                {/* Fields grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                            Full Name
                                        </div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                                            {result.idInfo.fullName}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                            Date of Birth
                                        </div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                                            {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(result.idInfo.dateOfBirth))}
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                            Document Number
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.12em', color: 'var(--color-text-primary)' }}>
                                                {result.idInfo.documentNumber.slice(0, 4)}&nbsp;••••&nbsp;••••&nbsp;{result.idInfo.documentNumber.slice(12)}
                                            </span>
                                            <StatusBadge
                                                status={result.documentMatch ? 'verified' : 'failed'}
                                                label={result.documentMatch ? 'Matched' : 'No match'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Biometric analysis */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div
                                style={{
                                    fontSize: 10, fontWeight: 700,
                                    letterSpacing: '0.09em', textTransform: 'uppercase',
                                    color: 'var(--color-text-muted)',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                                    <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                                </svg>
                                Biometric Analysis
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <ScoreRing score={result.compositeScore} passed={result.passed} size={100} />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <ScoreBar label="Face similarity" value={result.faceScore} color="#60a5fa" />
                                    <ScoreBar label="Liveness" value={result.livenessScore} color="#a78bfa" />
                                </div>
                            </div>
                        </div>

                        {/* Fail reason */}
                        {!result.passed && result.failReason && (
                            <div
                                style={{
                                    background: 'var(--color-error-subtle)',
                                    border: '1px solid var(--color-error-border)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '11px 14px',
                                    fontSize: 13,
                                    color: 'var(--color-error)',
                                    lineHeight: 1.6,
                                }}
                            >
                                {result.failReason}
                            </div>
                        )}

                        {!result.passed && result.attemptsRemaining > 0 && (
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
                                {result.attemptsRemaining} attempt{result.attemptsRemaining !== 1 ? 's' : ''} remaining today
                            </p>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                            {result.passed ? (
                                <Button fullWidth size="lg" onClick={continueAfterVerification}>
                                    Continue to dashboard
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
                                            setIdCardPreview(null);
                                            setSelfiePreview(null);
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

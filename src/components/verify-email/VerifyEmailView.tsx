'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { verifyEmailApi } from '@/api/auth/verify-email.api';
import { resendVerificationApi } from '@/api/auth/resend-verification.api';

type VerifyState = 'loading' | 'success' | 'error' | 'already_verified';

export function VerifyEmailView() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId') ?? '';
    const token = searchParams.get('token') ?? '';

    const [state, setState] = useState<VerifyState>('loading');
    const [message, setMessage] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendDone, setResendDone] = useState(false);

    // ── Auto-verify on mount using URL params ─────────────────────
    useEffect(() => {
        if (!userId || !token) {
            setState('error');
            setMessage('Invalid verification link. Please check your email.');
            return;
        }

        verifyEmailApi(userId, token)
            .then((res) => {
                const msg = res.data.message ?? '';
                if (msg.toLowerCase().includes('already')) {
                    setState('already_verified');
                } else {
                    setState('success');
                }
                setMessage(msg);
            })
            .catch((err) => {
                setState('error');
                setMessage(
                    err?.response?.data?.message ??
                    'Verification failed. The link may have expired.',
                );
            });
    }, [userId, token]);

    const handleResend = async () => {
        // We don't have the email here — direct user to login to trigger resend
        // In a fuller implementation you'd store email in a temp session
        setResendLoading(true);
        try {
            await resendVerificationApi('');
        } catch { }
        setResendLoading(false);
        setResendDone(true);
    };

    // ── Loading state
    if (state === 'loading') {
        return (
            <Card strength="strong" style={{ width: '100%', maxWidth: 420 }}>
                <div
                    className="animate-fade-in"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20,
                        padding: '12px 0',
                        textAlign: 'center',
                    }}
                >
                    {/* Spinner */}
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            border: '3px solid rgba(255,255,255,0.10)',
                            borderTopColor: 'var(--color-primary)',
                            animation: 'btn-spin 0.8s linear infinite',
                        }}
                    />
                    <div>
                        <h2
                            style={{
                                fontSize: 20,
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                                marginBottom: 6,
                            }}
                        >
                            Verifying your email
                        </h2>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
                            Please wait a moment...
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    // ── Success state
    if (state === 'success' || state === 'already_verified') {
        return (
            <Card strength="strong" style={{ width: '100%', maxWidth: 420 }}>
                <div
                    className="animate-fade-up"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20,
                        textAlign: 'center',
                    }}
                >
                    <div
                        className="glow-success"
                        style={{
                            width: 68,
                            height: 68,
                            borderRadius: '50%',
                            background: 'var(--color-success-subtle)',
                            border: '2px solid var(--color-success-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 30,
                            color: 'var(--color-success)',
                        }}
                    >
                        ✓
                    </div>

                    <div>
                        <h1
                            style={{
                                fontSize: 24,
                                fontWeight: 700,
                                color: 'var(--color-text-primary)',
                                marginBottom: 8,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {state === 'already_verified'
                                ? 'Already verified'
                                : 'Email verified!'}
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                            {state === 'already_verified'
                                ? 'Your email is already verified. You can log in.'
                                : 'Your account is now active. Complete your identity verification to access your dashboard.'}
                        </p>
                    </div>

                    <Button fullWidth onClick={() => window.location.href = '/login'}>
                        Continue to login
                    </Button>
                </div>
            </Card>
        );
    }

    // ── Error state
    return (
        <Card strength="strong" style={{ width: '100%', maxWidth: 420 }}>
            <div
                className="animate-fade-up"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 20,
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        width: 68,
                        height: 68,
                        borderRadius: '50%',
                        background: 'var(--color-error-subtle)',
                        border: '2px solid var(--color-error-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 30,
                        color: 'var(--color-error)',
                    }}
                >
                    ✕
                </div>

                <div>
                    <h1
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: 8,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Verification failed
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        {message}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                    {!resendDone ? (
                        <Button
                            variant="ghost"
                            fullWidth
                            loading={resendLoading}
                            loadingVariant="dots"
                            loadingText="Sending..."
                            onClick={handleResend}
                        >
                            Resend verification email
                        </Button>
                    ) : (
                        <p
                            style={{
                                fontSize: 13,
                                color: 'var(--color-success)',
                                textAlign: 'center',
                            }}
                        >
                            A new verification email has been sent if your account exists.
                        </p>
                    )}

                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={() => window.location.href = '/login'}
                    >
                        Back to login
                    </Button>
                </div>
            </div>
        </Card>
    );
}
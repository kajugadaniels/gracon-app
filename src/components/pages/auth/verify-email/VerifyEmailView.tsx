'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { PremiumLoader } from '@/components/ui/Loader';
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
        setResendLoading(true);
        try {
            if (!userId) {
                setMessage('This verification link is missing the account reference. Please register again or contact support.');
                return;
            }

            await resendVerificationApi({ userId });
        } catch (error: unknown) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : 'Unable to resend the verification email right now.',
            );
        } finally {
            setResendLoading(false);
        }

        setResendDone(true);
    };

    // ── Loading state
    if (state === 'loading') {
        return (
            <Card strength="strong" style={{ width: '100%', maxWidth: 400 }}>
                <div
                    className="animate-fade-in"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 18,
                        padding: '12px 0',
                        textAlign: 'center',
                    }}
                >
                    {/* Loader */}
                    <PremiumLoader size={44} color="primary" />
                    <div>
                        <h2
                            style={{
                                fontSize: 16,
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                                marginBottom: 5,
                            }}
                        >
                            Verifying your email
                        </h2>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
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
            <Card strength="strong" style={{ width: '100%', maxWidth: 400 }}>
                <div
                    className="animate-fade-up"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 18,
                        textAlign: 'center',
                    }}
                >
                    <div
                        className="glow-success animate-scale-in"
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'var(--color-success-subtle)',
                            border: '2px solid var(--color-success-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            color: 'var(--color-success)',
                        }}
                    >
                        ✓
                    </div>

                    <div>
                        <h1
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: 'var(--color-text-primary)',
                                marginBottom: 6,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {state === 'already_verified' ? 'Already verified' : 'Email verified!'}
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
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
        <Card strength="strong" style={{ width: '100%', maxWidth: 400 }}>
            <div
                className="animate-fade-up"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 18,
                    textAlign: 'center',
                }}
            >
                <div
                    className="animate-scale-in"
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'var(--color-error-subtle)',
                        border: '2px solid var(--color-error-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        color: 'var(--color-error)',
                    }}
                >
                    ✕
                </div>

                <div>
                    <h1
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: 6,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Verification failed
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {message}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                    {!resendDone ? (
                        <Button
                            variant="ghost"
                            fullWidth
                            loading={resendLoading}
                            loadingText="Sending..."
                            onClick={handleResend}
                        >
                            Resend verification email
                        </Button>
                    ) : (
                        <p
                            className="animate-fade-in"
                            style={{
                                fontSize: 13,
                                color: 'var(--color-success)',
                                textAlign: 'center',
                                margin: 0,
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

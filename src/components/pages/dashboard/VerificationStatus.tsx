'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, StatusBadge } from '@/components/ui';
import { getVerificationStatusApi } from '@/api/verification/get-status.api';
import { useApi } from '@/lib/hooks/useApi';

// Shows the current ID verification status on the dashboard
// If not verified — prompts user to complete the step
export function VerificationStatus() {
    const router = useRouter();

    const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const [canAttempt, setCanAttempt] = useState(false);

    const { execute: fetchStatus, loading } = useApi(getVerificationStatusApi, {
        onSuccess: (res) => {
            setIsVerified(res.isIdVerified);
            setAttemptsRemaining(res.attemptsRemaining);
            setCanAttempt(res.canAttempt);
        },
    });

    useEffect(() => { fetchStatus(); }, []);

    if (loading || isVerified === null) {
        return (
            <Card>
                <div
                    style={{
                        height: 52,
                        borderRadius: 8,
                        background: 'rgba(91,35,255,0.05)',
                        backgroundSize: '200% 100%',
                        backgroundImage:
                            'linear-gradient(90deg, rgba(91,35,255,0.04) 25%, rgba(91,35,255,0.10) 50%, rgba(91,35,255,0.04) 75%)',
                        animation: 'shimmer 1.4s ease-in-out infinite',
                    }}
                />
            </Card>
        );
    }

    if (isVerified) {
        return (
            <Card className="animate-fade-up">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                        className="glow-success"
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'var(--color-success-subtle)',
                            border: '2px solid var(--color-success-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 17,
                            color: 'var(--color-success)',
                            flexShrink: 0,
                        }}
                    >
                        ✓
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                                marginBottom: 2,
                            }}
                        >
                            Identity verified
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                            Your National ID has been verified successfully
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <StatusBadge status="verified" pulse label="Verified" />
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card
            className="animate-fade-up"
            style={{
                border: '1px solid rgba(217,119,6,0.22)',
                background: 'rgba(217,119,6,0.04)',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: 'var(--color-warning-subtle)',
                            border: '1px solid rgba(217,119,6,0.28)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            flexShrink: 0,
                        }}
                    >
                        ⚠
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                                marginBottom: 3,
                            }}
                        >
                            Identity verification required
                        </div>
                        <div
                            style={{
                                fontSize: 12,
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.5,
                            }}
                        >
                            You need to verify your identity before you can access all features.{' '}
                            {attemptsRemaining !== null && (
                                <span>{attemptsRemaining} attempt(s) remaining today.</span>
                            )}
                        </div>
                    </div>
                </div>

                {canAttempt ? (
                    <Button
                        size="sm"
                        onClick={() => router.push('/verify-identity')}
                        style={{ alignSelf: 'flex-start' }}
                    >
                        Complete verification
                    </Button>
                ) : (
                    <p
                        style={{
                            fontSize: 12,
                            color: 'var(--color-error)',
                            margin: 0,
                        }}
                    >
                        Maximum attempts reached for today. Please try again tomorrow or contact support.
                    </p>
                )}
            </div>
        </Card>
    );
}

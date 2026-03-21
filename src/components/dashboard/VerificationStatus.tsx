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
                        height: 60,
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: 8,
                        animation: 'shimmer 1.4s ease-in-out infinite',
                        backgroundSize: '200% 100%',
                        backgroundImage:
                            'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
                    }}
                />
            </Card>
        );
    }

    if (isVerified) {
        return (
            <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                        className="glow-success"
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: 'var(--color-success-subtle)',
                            border: '2px solid var(--color-success-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            color: 'var(--color-success)',
                            flexShrink: 0,
                        }}
                    >
                        ✓
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 15,
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                                marginBottom: 3,
                            }}
                        >
                            Identity verified
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                            Your National ID has been verified successfully
                        </div>
                    </div>
                    <StatusBadge status="verified" pulse label="Verified" />
                </div>
            </Card>
        );
    }

    return (
        <Card
            style={{
                border: '1px solid var(--color-warning-subtle)',
                background: 'rgba(245,158,11,0.04)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'var(--color-warning-subtle)',
                            border: '1px solid rgba(245,158,11,0.30)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            flexShrink: 0,
                        }}
                    >
                        ⚠
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 15,
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                                marginBottom: 4,
                            }}
                        >
                            Identity verification required
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.5,
                            }}
                        >
                            You need to verify your identity before you can access all
                            features.{' '}
                            {attemptsRemaining !== null && (
                                <span>
                                    {attemptsRemaining} attempt(s) remaining today.
                                </span>
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
                            fontSize: 13,
                            color: 'var(--color-error)',
                            margin: 0,
                        }}
                    >
                        Maximum attempts reached for today. Please try again tomorrow
                        or contact support.
                    </p>
                )}
            </div>
        </Card>
    );
}
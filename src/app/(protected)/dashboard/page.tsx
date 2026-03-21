'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { PlatformIdCard } from '@/components/dashboard/PlatformIdCard';
import { VerificationStatus } from '@/components/dashboard/VerificationStatus';
import { getVerificationStatusApi } from '@/api/verification/get-status.api';

// Dashboard — the main authenticated landing page
// Shows profile, verification status, and platform ID
export default function DashboardPage() {
    const { user } = useAuthStore();
    const [platformId, setPlatformId] = useState<string | null>(null);

    // Fetch verification status to get Platform ID if available
    useEffect(() => {
        getVerificationStatusApi()
            .then()
            .catch(() => { });
    }, []);

    return (
        <div
            style={{
                maxWidth: 760,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
            }}
        >
            {/* Page header */}
            <div>
                <h1
                    style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        marginBottom: 6,
                        letterSpacing: '-0.02em',
                    }}
                >
                    Welcome, {user?.postNames ?? 'User'}
                </h1>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
                    Here&apos;s an overview of your account and verification status.
                </p>
            </div>

            {/* Verification status banner — shown always */}
            <VerificationStatus />

            {/* Profile card */}
            <ProfileCard />

            {/* Platform ID — only show if user is verified */}
            {user?.isIdVerified && platformId && (
                <PlatformIdCard platformId={platformId} />
            )}
        </div>
    );
}
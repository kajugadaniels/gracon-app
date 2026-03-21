'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { ProfileCard } from '@/components/pages/dashboard';
import { PlatformIdCard } from '@/components/pages/dashboard';
import { VerificationStatus } from '@/components/pages/dashboard';

export default function DashboardPage() {
    const { user } = useAuthStore();

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

            {/* Verification status banner */}
            <VerificationStatus />

            {/* Profile card */}
            <ProfileCard />

            {/* Platform ID — only when verified */}
            {user?.isIdVerified && (
                <PlatformIdCard platformId="—" />
            )}
        </div>
    );
}
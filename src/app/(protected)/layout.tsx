'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { Navbar } from '@/components/shared';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isHydrated, accessToken, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isHydrated) return;
        if (!accessToken || !user) {
            router.replace('/login');
        }
    }, [isHydrated, accessToken, user, router]);

    // Waiting for sessionStorage → store hydration
    if (!isHydrated) {
        return (
            <div
                style={{
                    minHeight: '100dvh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: '3px solid rgba(91,35,255,0.14)',
                        borderTopColor: 'var(--color-primary)',
                        animation: 'btn-spin 0.75s linear infinite',
                    }}
                />
            </div>
        );
    }

    // Hydrated but not logged in — render nothing while redirect fires
    if (!accessToken || !user) {
        return null;
    }

    return (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '32px 24px' }}>
                {children}
            </main>
        </div>
    );
}

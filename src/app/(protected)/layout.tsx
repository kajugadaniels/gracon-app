'use client';

import { useEffect, useState } from 'react';
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
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Wait for store to hydrate before checking auth state
        if (!isHydrated) return;

        if (!accessToken || !user) {
            // No valid session — send to login
            router.replace('/login');
            return;
        }

        setReady(true);
    }, [isHydrated, accessToken, user, router]);

    // Show nothing while hydrating — prevents flash of protected content
    if (!ready) {
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
                        border: '3px solid rgba(255,255,255,0.10)',
                        borderTopColor: 'var(--color-primary)',
                        animation: 'btn-spin 0.75s linear infinite',
                    }}
                />
            </div>
        );
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
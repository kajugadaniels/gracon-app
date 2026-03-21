'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { Navbar } from '@/components/shared';
import { PremiumLoader } from '@/components/ui/Loader';

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
                <PremiumLoader size={40} color="primary" />
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

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { Navbar } from '@/components/shared/Navbar';
import { AppLoadingState } from '@/components/ui/AppLoadingState';
import { hasSessionHintCookie } from '@/lib/auth/session-cookie-policy';
import styles from './layout.module.css';

// Routes that render full-screen with no sidebar or layout chrome.
const FULL_SCREEN_ROUTES = new Set(['/verify-identity']);

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isHydrated, isLoading, accessToken, user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const hasSessionCookie = hasSessionHintCookie();

    useEffect(() => {
        if (!isHydrated) return;
        if (isLoading) return;
        if (!accessToken && !user && hasSessionCookie) return;
        if (!accessToken || !user) {
            router.replace('/login');
            return;
        }

        if (!user.isIdVerified && !FULL_SCREEN_ROUTES.has(pathname)) {
            router.replace(
                `/verify-identity?next=${encodeURIComponent(pathname)}`,
            );
        }
    }, [
        isHydrated,
        isLoading,
        accessToken,
        user,
        hasSessionCookie,
        pathname,
        router,
    ]);

    if (!isHydrated || isLoading || (!accessToken && !user && hasSessionCookie)) {
        return (
            <AppLoadingState
                variant="fullscreen"
                message="Opening your account..."
                detail="Restoring your secure Gracon session"
            />
        );
    }

    if (!accessToken || !user) {
        return (
            <AppLoadingState
                variant="fullscreen"
                message="Redirecting to sign in..."
                detail="Your session needs to be refreshed"
            />
        );
    }

    // Full-screen routes bypass the sidebar layout entirely — they own
    // their own page chrome (header, background, etc.)
    if (FULL_SCREEN_ROUTES.has(pathname)) {
        return <>{children}</>;
    }

    return (
        <div className={styles.protectedShell}>
            <Navbar />

            <div className={styles.protectedMain}>
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}

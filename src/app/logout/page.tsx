'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { logoutApi } from '@/api/auth/logout.api';
import { AppLoadingState } from '@/components/ui/AppLoadingState';
import { usePageTitle } from '@/lib/hooks/usePageTitle';

// This page handles logout triggered by app/documents or any other sub-app.
// It clears the app/app auth store, clears cookies, and redirects to login.

export default function LogoutPage() {
    const { clearAuth, refreshToken } = useAuthStore();
    usePageTitle('Logout');

    useEffect(() => {
        let cancelled = false;

        const runLogout = async () => {
            try {
                if (refreshToken) {
                    await logoutApi(refreshToken);
                }
            } catch {
                // Local logout must still complete even if token revocation fails.
            } finally {
                if (cancelled) return;
                clearAuth();
                window.location.replace('/login');
            }
        };

        void runLogout();

        return () => {
            cancelled = true;
        };
    }, [clearAuth, refreshToken]);

    return (
        <AppLoadingState
            variant="fullscreen"
            message="Signing you out..."
            detail="Closing your secure session"
        />
    );
}

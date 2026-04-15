'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { logoutApi } from '@/api/auth/logout.api';

// This page handles logout triggered by app/documents or any other sub-app.
// It clears the app/app auth store, clears cookies, and redirects to login.

export default function LogoutPage() {
    const { clearAuth, refreshToken } = useAuthStore();

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
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(91,35,255,0.2)', borderTopColor: 'var(--color-primary)', animation: 'btn-spin 0.7s linear infinite' }} />
        </div>
    );
}

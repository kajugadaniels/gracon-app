'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { useRouter } from 'next/navigation';

// This page handles logout triggered by app/documents or any other sub-app.
// It clears the app/app auth store, clears cookies, and redirects to login.

export default function LogoutPage() {
    const { clearAuth } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        clearAuth();          // clears sessionStorage + g360_at + g360_rt cookies
        router.replace('/login');
    }, [clearAuth, router]);

    return (
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(91,35,255,0.2)', borderTopColor: 'var(--color-primary)', animation: 'btn-spin 0.7s linear infinite' }} />
        </div>
    );
}
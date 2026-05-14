'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { AppLoadingState } from '@/components/ui/AppLoadingState';
import styles from './layout.module.css';

// Routes that render full-screen with no sidebar or layout chrome.
const FULL_SCREEN_ROUTES = new Set(['/verify-identity']);

// Sidebar width constants — must match AppSidebar
const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 68;

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isHydrated, isLoading, accessToken, user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const hasSessionCookie =
        typeof document !== 'undefined' && document.cookie.includes('session_active=');

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
        <>
            {/* Sidebar — fixed position, manages its own width via store */}
            <AppSidebar />

            {/*
        Main content area — pushed right by the sidebar width.
        We use CSS custom properties so the offset updates instantly
        when the sidebar collapses, matching the sidebar's transition.
      */}
            <div
                id="protected-main"
                className={styles.protectedMain}
            >
                <main className={styles.content}>
                    {children}
                </main>
            </div>

            {/*
        Sidebar collapse sync — listens to store and updates the
        margin-left on #protected-main so the layout tracks the sidebar.
      */}
            <SidebarMarginSync
                expanded={SIDEBAR_EXPANDED}
                collapsed={SIDEBAR_COLLAPSED}
            />

        </>
    );
}

// ─── Sidebar margin sync ──────────────────────────────────────────────────────
// A tiny client component that watches the sidebar store and keeps
// #protected-main's margin-left in sync without a full re-render of the layout.

import { useSidebarStore } from '@/lib/store/sidebar.store';

function SidebarMarginSync({
    expanded,
    collapsed,
}: {
    expanded: number;
    collapsed: number;
}) {
    const isCollapsed = useSidebarStore((s) => s.collapsed);

    useEffect(() => {
        const main = document.getElementById('protected-main');
        if (main) {
            main.style.marginLeft = `${isCollapsed ? collapsed : expanded}px`;
        }
    }, [isCollapsed, expanded, collapsed]);

    return null;
}

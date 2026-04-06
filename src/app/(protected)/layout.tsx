'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { AppSidebar } from '@/components/shared/AppSidebar';
import { PremiumLoader } from '@/components/ui/Loader';

// Sidebar width constants — must match AppSidebar
const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 68;

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

    if (!isHydrated) {
        return (
            <div
                style={{
                    minHeight: '100dvh', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                }}
            >
                <PremiumLoader size={40} color="primary" />
            </div>
        );
    }

    if (!accessToken || !user) return null;

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
                style={{
                    /*
                      We can't read the Zustand store here (Server Component boundary risk),
                      so we use a CSS var approach: the sidebar writes its width to a CSS var
                      on <html>, and this element reads it.
                      Fallback: start at SIDEBAR_EXPANDED width.
                    */
                    marginLeft: SIDEBAR_EXPANDED,
                    minHeight: '100dvh',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'margin-left 250ms cubic-bezier(0.4,0,0.2,1)',
                }}
            >
                <main
                    style={{
                        flex: 1,
                        padding: '40px 32px',
                        maxWidth: 960,
                    }}
                >
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

            {/*
        Responsive: on mobile the sidebar is hidden by default and
        the content takes full width.
      */}
            <style>{`
        @media (max-width: 767px) {
          #protected-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
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
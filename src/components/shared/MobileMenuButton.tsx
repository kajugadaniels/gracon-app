'use client';

import { useSidebarStore } from '@/lib/store/sidebar.store';

export function MobileMenuButton() {
    const openMobile = useSidebarStore((s) => s.openMobile);

    return (
        <button
            onClick={openMobile}
            aria-label="Open navigation"
            style={{
                display: 'none', // shown via CSS @media below
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'transparent',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                flexShrink: 0,
            }}
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
        </button>
    );
}
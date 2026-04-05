'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { logoutApi } from '@/api/auth/logout.api';

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconDashboard() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
    );
}

function IconProfile() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    );
}

function IconSign() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
    );
}

function IconVerify() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
        </svg>
    );
}

function IconLogout() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
    { href: '/profile', label: 'Profile', Icon: IconProfile },
    { href: '/profile/signing', label: 'Sign Documents', Icon: IconSign },
];

const PUBLIC_ITEMS = [
    { href: '/verify', label: 'Verify Signature', Icon: IconVerify, external: true },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, refreshToken, clearAuth } = useAuthStore();
    const [loggingOut, setLoggingOut] = useState(false);

    // Active check — /profile/signing should not mark /profile active
    function isActive(href: string) {
        if (href === '/profile') {
            return pathname === '/profile';
        }
        return pathname === href || pathname.startsWith(href + '/');
    }

    async function handleLogout() {
        setLoggingOut(true);
        try {
            if (refreshToken) await logoutApi(refreshToken);
        } catch { /* always clear locally */ }
        document.cookie =
            'session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        clearAuth();
        router.push('/login');
    }

    // User initials for avatar
    const initials = [user?.postNames?.[0], user?.surName?.[0]]
        .filter(Boolean)
        .join('')
        .toUpperCase() || '?';

    return (
        <aside
            style={{
                width: 240,
                minHeight: '100dvh',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(24px)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                position: 'sticky',
                top: 0,
                alignSelf: 'flex-start',
            }}
        >
            {/* Brand */}
            <div
                style={{
                    padding: '24px 20px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                        color: '#fff',
                        flexShrink: 0,
                    }}
                >
                    G
                </div>
                <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                        Gracon 360
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
                        Digital Trust
                    </div>
                </div>
            </div>

            {/* Main nav */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* Section label */}
                <p
                    style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '0 8px',
                        marginBottom: 6,
                    }}
                >
                    Navigation
                </p>

                {NAV_ITEMS.map(({ href, label, Icon }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-md)',
                                textDecoration: 'none',
                                background: active ? 'var(--color-primary-subtle)' : 'transparent',
                                border: active
                                    ? '1px solid var(--color-border-primary)'
                                    : '1px solid transparent',
                                color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                fontSize: 14,
                                fontWeight: active ? 600 : 400,
                                transition: 'all 150ms ease',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={e => {
                                if (!active) {
                                    e.currentTarget.style.background = 'var(--color-bg-elevated-hover)';
                                    e.currentTarget.style.color = 'var(--color-text-primary)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!active) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                                }
                            }}
                        >
                            <span style={{ opacity: active ? 1 : 0.65, flexShrink: 0 }}>
                                <Icon />
                            </span>
                            {label}
                        </Link>
                    );
                })}

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '12px 8px' }} />

                {/* Public tools section */}
                <p
                    style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '0 8px',
                        marginBottom: 6,
                    }}
                >
                    Tools
                </p>

                {PUBLIC_ITEMS.map(({ href, label, Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            background: 'transparent',
                            border: '1px solid transparent',
                            color: 'var(--color-text-secondary)',
                            fontSize: 14,
                            fontWeight: 400,
                            transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--color-bg-elevated-hover)';
                            e.currentTarget.style.color = 'var(--color-text-primary)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                        }}
                    >
                        <span style={{ opacity: 0.65, flexShrink: 0 }}>
                            <Icon />
                        </span>
                        {label}
                        {/* External link indicator */}
                        <svg
                            width="10" height="10" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                            style={{ marginLeft: 'auto', opacity: 0.4 }}
                        >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                    </Link>
                ))}
            </nav>

            {/* User section at bottom */}
            <div
                style={{
                    padding: '16px 12px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                {/* User info */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 8,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    {/* Avatar */}
                    {user?.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={user.imageUrl}
                            alt="Profile"
                            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                background: 'var(--color-primary-subtle)',
                                border: '1px solid var(--color-border-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                fontWeight: 700,
                                color: 'var(--color-primary)',
                                flexShrink: 0,
                            }}
                        >
                            {initials}
                        </div>
                    )}
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--color-text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {user?.postNames ?? 'User'}
                        </p>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 11,
                                color: 'var(--color-text-muted)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {user?.email ?? ''}
                        </p>
                    </div>
                </div>

                {/* Logout button */}
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'transparent',
                        border: '1px solid transparent',
                        color: 'var(--color-text-muted)',
                        fontSize: 13,
                        fontWeight: 400,
                        cursor: loggingOut ? 'not-allowed' : 'pointer',
                        opacity: loggingOut ? 0.5 : 1,
                        transition: 'all 150ms ease',
                        fontFamily: 'var(--font-sans)',
                    }}
                    onMouseEnter={e => {
                        if (!loggingOut) {
                            e.currentTarget.style.background = 'var(--color-error-subtle)';
                            e.currentTarget.style.color = 'var(--color-error)';
                            e.currentTarget.style.borderColor = 'var(--color-error-border)';
                        }
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                        e.currentTarget.style.borderColor = 'transparent';
                    }}
                >
                    <IconLogout />
                    {loggingOut ? 'Signing out…' : 'Sign out'}
                </button>
            </div>
        </aside>
    );
}
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/lib/store/sidebar.store';
import { useAuthStore } from '@/lib/store/auth.store';

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconDashboard() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    );
}

function IconChevron({ collapsed }: { collapsed: boolean }) {
    return (
        <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'transform 250ms ease', transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}

function IconMenu() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

function IconSignature() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

function IconDocument() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { href: '/dashboard',          label: 'Dashboard',        Icon: IconDashboard, exact: true,  external: false },
    { href: '/profile',            label: 'Profile',          Icon: IconProfile,   exact: true,  external: false },
    { href: '/profile/signature',  label: 'Digital Signature',Icon: IconSignature, exact: false, external: false },
    {
        href: process.env.NEXT_PUBLIC_DOCS_URL ?? 'http://localhost:4002/documents',
        label: 'Documents',
        Icon: IconDocument,
        exact: false,
        external: true,
    },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function AppSidebar() {
    const pathname = usePathname();
    const collapsed = useSidebarStore((s) => s.collapsed);
    const mobileOpen = useSidebarStore((s) => s.mobileOpen);
    const toggle = useSidebarStore((s) => s.toggle);
    const closeMobile = useSidebarStore((s) => s.closeMobile);
    const { user } = useAuthStore();

    const initials = user
        ? `${(user.postNames?.[0] ?? '').toUpperCase()}${(user.surName?.[0] ?? '').toUpperCase()}`
        : '??';

    const displayName = user
        ? `${user.postNames} ${user.surName}`.trim()
        : 'User';

    function isActive(href: string, exact: boolean) {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    }

    const sidebarWidth = collapsed ? 68 : 240;

    return (
        <>
            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    onClick={closeMobile}
                    aria-hidden="true"
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(91,35,255,0.08)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 40,
                    }}
                />
            )}

            {/* Sidebar */}
            <aside
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100dvh',
                    width: sidebarWidth,
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRight: '1px solid var(--color-border)',
                    boxShadow: '4px 0 24px rgba(91,35,255,0.06)',
                    transition: 'width 250ms cubic-bezier(0.4,0,0.2,1)',
                    overflow: 'hidden',

                    // Mobile: slide in from left
                    transform: mobileOpen
                        ? 'translateX(0)'
                        : typeof window !== 'undefined' && window.innerWidth < 768
                            ? 'translateX(-100%)'
                            : 'translateX(0)',
                }}
            >
                {/* Top bar — logo + collapse button */}
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'space-between',
                        padding: collapsed ? '0 14px' : '0 16px 0 20px',
                        borderBottom: '1px solid var(--color-border)',
                        flexShrink: 0,
                    }}
                >
                    {!collapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                                style={{
                                    width: 30, height: 30, borderRadius: 8,
                                    background: 'var(--color-primary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: 14, fontWeight: 800, letterSpacing: '-0.02em',
                                    flexShrink: 0,
                                }}
                            >
                                G
                            </div>
                            <span
                                style={{
                                    fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)',
                                    letterSpacing: '-0.02em', whiteSpace: 'nowrap',
                                }}
                            >
                                Gracon 360
                            </span>
                        </div>
                    )}

                    <button
                        onClick={toggle}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'transparent',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            transition: 'background 150ms ease, border-color 150ms ease',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(91,35,255,0.06)';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-hover)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
                        }}
                    >
                        <IconChevron collapsed={collapsed} />
                    </button>
                </div>

                {/* Nav items */}
                <nav
                    style={{
                        flex: 1, overflowY: 'auto', overflowX: 'hidden',
                        padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2,
                    }}
                >
                    {NAV_ITEMS.map(({ href, label, Icon, exact, external }) => {
                        const active = external ? false : isActive(href, exact);
                        return (
                            <Link
                                key={href}
                                href={href}
                                title={collapsed ? label : undefined}
                                target={external ? '_blank' : undefined}
                                rel={external ? 'noopener noreferrer' : undefined}
                                onClick={() => closeMobile()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: collapsed ? '10px 0' : '10px 12px',
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    borderRadius: 10,
                                    textDecoration: 'none',
                                    fontWeight: active ? 600 : 400,
                                    fontSize: 14,
                                    color: active
                                        ? 'var(--color-primary)'
                                        : 'var(--color-text-secondary)',
                                    background: active
                                        ? 'var(--color-primary-subtle)'
                                        : 'transparent',
                                    border: `1px solid ${active ? 'var(--color-border-primary)' : 'transparent'}`,
                                    transition: 'all 150ms ease',
                                    whiteSpace: 'nowrap',
                                    position: 'relative',
                                }}
                                onMouseEnter={e => {
                                    if (!active) {
                                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(91,35,255,0.05)';
                                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-primary)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!active) {
                                        (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-secondary)';
                                    }
                                }}
                            >
                                <span style={{ flexShrink: 0 }}>
                                    <Icon />
                                </span>
                                {!collapsed && <span>{label}</span>}

                                {/* Active indicator dot */}
                                {active && (
                                    <span
                                        style={{
                                            position: 'absolute', right: 12,
                                            width: 6, height: 6, borderRadius: '50%',
                                            background: 'var(--color-primary)',
                                            display: collapsed ? 'none' : 'block',
                                        }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom user strip */}
                <div
                    style={{
                        padding: collapsed ? '12px 10px' : '12px 14px',
                        borderTop: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        flexShrink: 0,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                >
                    {/* Avatar */}
                    <div
                        style={{
                            width: 36, height: 36,
                            borderRadius: '50%',
                            background: 'var(--color-primary-subtle)',
                            border: '2px solid var(--color-border-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700,
                            color: 'var(--color-primary)',
                            flexShrink: 0,
                            overflow: 'hidden',
                        }}
                    >
                        {user?.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.imageUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            initials
                        )}
                    </div>

                    {!collapsed && (
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <p
                                style={{
                                    margin: 0, fontSize: 13, fontWeight: 600,
                                    color: 'var(--color-text-primary)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}
                            >
                                {displayName}
                            </p>
                            <p
                                style={{
                                    margin: '1px 0 0', fontSize: 11,
                                    color: 'var(--color-text-muted)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}
                            >
                                {user?.email ?? ''}
                            </p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

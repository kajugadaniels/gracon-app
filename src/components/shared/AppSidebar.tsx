'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebarStore } from '@/lib/store/sidebar.store';
import { useAuthStore } from '@/lib/store/auth.store';
import { normalizeImageUrl } from '@/lib/normalize-image-url';
import { NAV_ITEMS } from '@/constants/nav';
import styles from './AppSidebar.module.css';

// ─── Internal icons (not part of nav data) ────────────────────────────────────

function IconChevron({ collapsed }: { collapsed: boolean }) {
    return (
        <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={`${styles.chevron} ${collapsed ? styles.chevronCollapsed : ''}`}
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

function IconLogout({ size = 16 }: { size?: number }) {
    return (
        <svg
            width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
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
    const profileImageUrl = normalizeImageUrl(user?.imageUrl);

    function isActive(href: string, exact: boolean) {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    }

    return (
        <>
            {/* Mobile backdrop */}
            {mobileOpen && (
                <div
                    onClick={closeMobile}
                    aria-hidden="true"
                    className={styles.backdrop}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
            >
                {/* Top bar — logo + collapse button */}
                <div className={styles.topBar}>
                    {!collapsed && (
                        <div className={styles.brand}>
                            <div className={styles.brandMark}>
                                G
                            </div>
                            <span className={styles.brandName}>
                                Gracon 360
                            </span>
                        </div>
                    )}

                    <button
                        onClick={toggle}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className={styles.iconButton}
                    >
                        <IconChevron collapsed={collapsed} />
                    </button>
                </div>

                {/* Nav items */}
                <nav className={styles.nav}>
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
                                className={`${styles.navItem} ${active ? styles.navItemActive : ''} ${collapsed ? styles.navItemCollapsed : ''}`}
                            >
                                <span className={styles.navIcon}>
                                    <Icon />
                                </span>
                                {!collapsed && <span>{label}</span>}

                                {/* Active indicator dot */}
                                {active && (
                                    <span className={styles.activeDot} />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom user strip */}
                <div className={styles.userStrip}>
                    {/* Avatar */}
                    <div className={styles.avatar}>
                        {profileImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profileImageUrl} alt={displayName} className={styles.avatarImage} />
                        ) : (
                            initials
                        )}
                    </div>

                    {!collapsed && (
                        <div className={styles.userText}>
                            <p className={styles.userName}>
                                {displayName}
                            </p>
                            <p className={styles.userEmail}>
                                {user?.email ?? ''}
                            </p>
                        </div>
                    )}

                    {/* Logout button — shown next to name when expanded, below avatar when collapsed */}
                    <button
                        onClick={() => router.push('/logout')}
                        title="Log out"
                        aria-label="Log out"
                        className={styles.logoutButton}
                    >
                        <IconLogout size={14} />
                    </button>
                </div>
            </aside>
        </>
    );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { normalizeImageUrl } from '@/lib/normalize-image-url';
import { NAV_ITEMS, type NavItem } from '@/constants/nav';
import { toast } from '@/components/ui';
import styles from './Navbar.module.css';

function IconMenu({ open }: { open: boolean }) {
    if (open) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
            </svg>
        );
    }

    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

function IconLogout() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5M21 12H9" />
        </svg>
    );
}

function getInitials(postNames?: string, surName?: string) {
    const first = postNames?.trim().charAt(0) ?? '';
    const second = surName?.trim().charAt(0) ?? '';
    return `${first}${second}`.toUpperCase() || 'G';
}

export function Navbar() {
    const pathname = usePathname();
    const { user, refreshToken, clearAuth } = useAuthStore();
    const [menuOpen, setMenuOpen] = useState(false);

    const displayName = user ? `${user.postNames} ${user.surName}`.trim() : 'Account';
    const profileImageUrl = normalizeImageUrl(user?.imageUrl);
    const initials = getInitials(user?.postNames, user?.surName);

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
        } catch {
            // Logout remains client-successful even if the session is already gone.
        } finally {
            clearAuth();
            window.location.replace('/login');
        }
    };

    const handleComingSoon = (label: string) => {
        toast.info(`${label} is coming soon`, {
            description: 'This workspace is being prepared for Gracon 360 users.',
        });
        setMenuOpen(false);
    };

    return (
        <header className={styles.shell}>
            <nav className={styles.topbar} aria-label="Primary navigation">
                <Link href="/dashboard" className={styles.brand} onClick={() => setMenuOpen(false)}>
                    <span className={styles.brandMark}>G</span>
                    <span className={styles.brandText}>
                        <span className={styles.brandName}>Gracon 360</span>
                        <span className={styles.brandMeta}>Secure workspace</span>
                    </span>
                </Link>

                <div className={styles.desktopNav}>
                    {NAV_ITEMS.map((item) => (
                        <NavEntry
                            key={`${item.label}-${item.href}`}
                            item={item}
                            pathname={pathname}
                            onComingSoon={handleComingSoon}
                        />
                    ))}
                </div>

                <div className={styles.accountCluster}>
                    <Link href="/profile" className={styles.userPill}>
                        <span className={styles.avatar}>
                            {profileImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profileImageUrl} alt={displayName} className={styles.avatarImage} />
                            ) : (
                                initials
                            )}
                        </span>
                        <span className={styles.userText}>
                            <span className={styles.userName}>{displayName}</span>
                            <span className={styles.userEmail}>{user?.email ?? 'Signed in'}</span>
                        </span>
                    </Link>

                    <button className={styles.logoutButton} type="button" onClick={handleLogout} aria-label="Log out">
                        <IconLogout />
                    </button>

                    <button
                        className={styles.menuButton}
                        type="button"
                        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <IconMenu open={menuOpen} />
                    </button>
                </div>
            </nav>

            {menuOpen ? (
                <div className={styles.mobilePanel}>
                    <div className={styles.mobileNav}>
                        {NAV_ITEMS.map((item) => (
                            <NavEntry
                                key={`mobile-${item.label}-${item.href}`}
                                item={item}
                                pathname={pathname}
                                onComingSoon={handleComingSoon}
                                onNavigate={() => setMenuOpen(false)}
                                mobile
                            />
                        ))}
                    </div>
                </div>
            ) : null}
        </header>
    );
}

function NavEntry({
    item,
    pathname,
    onComingSoon,
    onNavigate,
    mobile = false,
}: {
    item: NavItem;
    pathname: string;
    onComingSoon: (label: string) => void;
    onNavigate?: () => void;
    mobile?: boolean;
}) {
    const active = !item.external && !item.comingSoon && (
        item.exact ? pathname === item.href : pathname.startsWith(item.href)
    );
    const Icon = item.Icon;
    const className = [
        mobile ? styles.mobileLink : styles.navLink,
        active ? (mobile ? styles.mobileLinkActive : styles.navLinkActive) : '',
        item.comingSoon ? styles.navLinkMuted : '',
    ].filter(Boolean).join(' ');

    const content = (
        <>
            <span className={styles.navIcon}><Icon /></span>
            <span className={styles.navLabel}>{item.label}</span>
            {item.comingSoon ? <span className={styles.comingBadge}>Soon</span> : null}
        </>
    );

    if (item.comingSoon) {
        return (
            <button
                type="button"
                className={className}
                data-tooltip={item.description}
                onClick={() => onComingSoon(item.label)}
            >
                {content}
            </button>
        );
    }

    return (
        <Link
            href={item.href}
            className={className}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            data-tooltip={item.description}
            onClick={onNavigate}
        >
            {content}
        </Link>
    );
}

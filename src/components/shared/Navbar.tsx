/**
 * Responsive authenticated top navigation for app/app.
 *
 * The header keeps product navigation separate from the account dropdown so
 * the signed-in user controls stay compact and consistent with sibling apps.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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

function IconSettings() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.21.63.8 1 1.51 1H21a2 2 0 0 1 0 4h-.09c-.7 0-1.3.37-1.51 1Z" />
        </svg>
    );
}

function getInitials(postNames?: string, surName?: string) {
    const first = postNames?.trim().charAt(0) ?? '';
    const second = surName?.trim().charAt(0) ?? '';
    return `${first}${second}`.toUpperCase() || 'G';
}

/** Renders the protected application navbar with avatar-only account controls. */
export function Navbar() {
    const pathname = usePathname();
    const { user, refreshToken, clearAuth } = useAuthStore();
    const [menuOpen, setMenuOpen] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [avatarLoaded, setAvatarLoaded] = useState(false);
    const [avatarFailed, setAvatarFailed] = useState(false);
    const accountMenuRef = useRef<HTMLDivElement>(null);

    const displayName = user ? `${user.postNames} ${user.surName}`.trim() : 'Account';
    const profileImageUrl = avatarFailed ? null : normalizeImageUrl(user?.imageUrl);
    const initials = getInitials(user?.postNames, user?.surName);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!accountMenuRef.current?.contains(event.target as Node)) {
                setAccountMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);

    useEffect(() => {
        setAvatarLoaded(false);
        setAvatarFailed(false);
    }, [user?.userId, user?.imageUrl]);

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
                    <div ref={accountMenuRef} className={styles.accountMenu}>
                        <button
                            className={styles.avatarButton}
                            type="button"
                            title={displayName}
                            aria-label="Open account menu"
                            aria-expanded={accountMenuOpen}
                            aria-haspopup="menu"
                            onClick={() => setAccountMenuOpen((open) => !open)}
                        >
                            <AccountAvatar
                                source={profileImageUrl}
                                displayName={displayName}
                                initials={initials}
                                loaded={avatarLoaded}
                                size="md"
                                onLoad={() => setAvatarLoaded(true)}
                                onError={() => {
                                    setAvatarFailed(true);
                                    setAvatarLoaded(false);
                                }}
                            />
                        </button>

                        {accountMenuOpen ? (
                            <div className={styles.accountDropdown} role="menu">
                                <div className={styles.accountProfile}>
                                    <AccountAvatar
                                        source={profileImageUrl}
                                        displayName={displayName}
                                        initials={initials}
                                        loaded={avatarLoaded}
                                        size="sm"
                                        onLoad={() => setAvatarLoaded(true)}
                                        onError={() => {
                                            setAvatarFailed(true);
                                            setAvatarLoaded(false);
                                        }}
                                    />
                                    <div className={styles.accountCopy}>
                                        <p>{displayName}</p>
                                        <span>{user?.email ?? 'Signed in'}</span>
                                    </div>
                                </div>

                                <Link
                                    className={styles.accountItem}
                                    href="/settings"
                                    role="menuitem"
                                    onClick={() => {
                                        setAccountMenuOpen(false);
                                        setMenuOpen(false);
                                    }}
                                >
                                    <IconSettings />
                                    <span>Settings</span>
                                </Link>

                                <button
                                    className={styles.accountItemDanger}
                                    type="button"
                                    role="menuitem"
                                    onClick={handleLogout}
                                >
                                    <IconLogout />
                                    <span>Sign out</span>
                                </button>
                            </div>
                        ) : null}
                    </div>

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

/**
 * Displays a robust profile avatar with the same loading/fallback behavior as
 * the documents workspace avatar.
 */
function AccountAvatar({
    source,
    displayName,
    initials,
    loaded,
    size,
    onLoad,
    onError,
}: {
    source: string | null;
    displayName: string;
    initials: string;
    loaded: boolean;
    size: 'sm' | 'md';
    onLoad: () => void;
    onError: () => void;
}) {
    return (
        <span className={`${styles.avatar} ${styles[size]}`} aria-label={displayName}>
            {source && !loaded ? <span className={styles.avatarLoading} aria-hidden="true" /> : null}
            {source ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={source}
                    alt={`${displayName} profile photo`}
                    className={`${styles.avatarImage} ${loaded ? styles.avatarImageLoaded : ''}`}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onLoad={onLoad}
                    onError={onError}
                />
            ) : (
                <span className={styles.avatarInitials}>{initials}</span>
            )}
        </span>
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

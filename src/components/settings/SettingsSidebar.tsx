/**
 * Route-aware sidebar for the account settings workspace.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './settings-sidebar.module.css';

const SETTINGS_LINKS = [
    {
        href: '/settings/profile',
        label: 'Profile',
        description: 'Account, identity, and security details.',
        Icon: IconProfile,
    },
    {
        href: '/settings',
        label: 'Workspace settings',
        description: 'Default checks for invitations.',
        Icon: IconWorkspace,
    },
    {
        href: '/settings/activity',
        label: 'User activity',
        description: 'Read-only account action history.',
        Icon: IconActivity,
    },
] as const;

/**
 * Renders the compact settings navigation shared by settings routes.
 */
export function SettingsSidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar} aria-label="Settings navigation">
            <div className={styles.header}>
                <span className={styles.headerMark}>S</span>
                <div>
                    <p>Settings</p>
                    <h1>Account controls</h1>
                </div>
            </div>

            <nav className={styles.nav} aria-label="Settings sections">
                {SETTINGS_LINKS.map((link) => {
                    const active = pathname === link.href;
                    const Icon = link.Icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={[
                                styles.item,
                                active ? styles.itemActive : '',
                            ].filter(Boolean).join(' ')}
                            aria-current={active ? 'page' : undefined}
                        >
                            <span className={styles.itemIcon} aria-hidden="true">
                                <Icon />
                            </span>
                            <span className={styles.itemCopy}>
                                <strong>{link.label}</strong>
                                <small>{link.description}</small>
                            </span>
                            {active ? <span className={styles.itemStatus}>Current</span> : null}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

function IconProfile() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function IconActivity() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m7 14 3-3 3 2 5-6" />
            <path d="M17 7h1v1" />
        </svg>
    );
}

function IconWorkspace() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M8 9h8M8 13h5" />
            <path d="M16 17h1" />
        </svg>
    );
}

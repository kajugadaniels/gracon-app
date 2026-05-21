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
    },
    {
        href: '/settings',
        label: 'Workspace settings',
        description: 'Default checks for invitations.',
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
                <p>Settings</p>
                <h1>Account controls</h1>
            </div>

            <nav className={styles.nav} aria-label="Settings sections">
                {SETTINGS_LINKS.map((link) => {
                    const active = pathname === link.href;
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
                            <span>{link.label}</span>
                            <small>{link.description}</small>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

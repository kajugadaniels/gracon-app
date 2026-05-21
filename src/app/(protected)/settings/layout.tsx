/**
 * Shared settings layout for account and workspace preference pages.
 */
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import styles from './settings-layout.module.css';

/**
 * Wraps settings routes with a compact, route-aware sidebar.
 */
export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.layout}>
            <SettingsSidebar />
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}

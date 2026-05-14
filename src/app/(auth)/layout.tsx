// Layout for unauthenticated pages — login, register, verify-email
// Centered single-column layout — no navbar or sidebar
import styles from './layout.module.css';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <main className={styles.shell}>{children}</main>;
}

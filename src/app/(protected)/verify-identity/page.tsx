/**
 * Identity verification page — full-screen, no sidebar.
 * Rendered inside the (protected) route group so the auth guard still applies,
 * but the parent layout bypasses its sidebar shell for this route.
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerificationForm } from '@/components/pages/verification';
import styles from './verify-identity-page.module.css';

export const metadata: Metadata = {
    title: 'Verify Identity',
    description: 'Complete your identity verification to access your account',
};

/** Inline lock icon — no external icon dependency. */
function LockIcon() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

/** Inline shield-check icon — used in the page heading pill. */
function ShieldIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}

export default function VerifyIdentityPage() {
    return (
        <div className={styles.page}>
            {/* ── Minimal sticky header ───────────────────────────────── */}
            <header className={styles.header}>
                {/* Wordmark */}
                <div className={styles.wordmark}>
                    <div className={styles.logo}>
                        <span className={styles.logoText}>
                            G
                        </span>
                    </div>
                    <span className={styles.brandName}>
                        Gracon
                    </span>
                </div>

                {/* Secure session badge */}
                <div className={styles.secureBadge}>
                    <LockIcon />
                    Secure session
                </div>
            </header>

            {/* ── Main content ─────────────────────────────────────────── */}
            <main className={styles.main}>
                {/*
                    Ambient radial glow — a soft purple halo centered behind
                    the card. Pure CSS, zero JS cost, GPU composited.
                */}
                <div aria-hidden="true" className={styles.ambient} />

                {/* Page heading */}
                <div
                    className={`${styles.heading} animate-fade-up`}
                >
                    {/* Pill label */}
                    <div className={styles.pill}>
                        <ShieldIcon />
                        Identity Verification
                    </div>

                    <h1 className={styles.title}>
                        Verify your identity
                    </h1>

                    <p className={styles.subtitle}>
                        A one-time process. Your information stays private
                        and is never stored without your consent.
                    </p>
                </div>

                {/* Verification card — constrained width, centred */}
                <div className={styles.formWrap}>
                    {/*
                        Suspense is required because VerificationForm calls
                        useSearchParams(), which needs a boundary in the
                        App Router server-component tree.
                    */}
                    <Suspense>
                        <VerificationForm />
                    </Suspense>
                </div>
            </main>

            {/* ── Footer ────────────────────────────────────────────────── */}
            <footer className={styles.footer}>
                <span>End-to-end encrypted</span>
                <span aria-hidden="true" className={styles.dot}>·</span>
                <span>Powered by Gracon Tech</span>
                <span aria-hidden="true" className={styles.dot}>·</span>
                <span>Your data is never shared</span>
            </footer>
        </div>
    );
}

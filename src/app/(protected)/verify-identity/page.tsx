/**
 * Identity verification page — full-screen, no sidebar.
 * Rendered inside the (protected) route group so the auth guard still applies,
 * but the parent layout bypasses its sidebar shell for this route.
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerificationForm } from '@/components/pages/verification';

export const metadata: Metadata = {
    title: 'Verify Identity — Gracon',
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
        <div
            style={{
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* ── Minimal sticky header ───────────────────────────────── */}
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    background: 'rgba(236, 233, 255, 0.80)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(91, 35, 255, 0.08)',
                }}
            >
                {/* Wordmark */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 9,
                            background: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow:
                                '0 3px 0 0 #3d16c0, 0 4px 12px rgba(91,35,255,0.30)',
                            flexShrink: 0,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: '#fff',
                                letterSpacing: '-0.04em',
                                lineHeight: 1,
                            }}
                        >
                            G
                        </span>
                    </div>
                    <span
                        style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Gracon
                    </span>
                </div>

                {/* Secure session badge */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 12px',
                        borderRadius: 999,
                        background: 'rgba(5, 150, 105, 0.08)',
                        border: '1px solid rgba(5, 150, 105, 0.22)',
                        color: 'var(--color-success)',
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: '0.01em',
                    }}
                >
                    <LockIcon />
                    Secure session
                </div>
            </header>

            {/* ── Main content ─────────────────────────────────────────── */}
            <main
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 16px 48px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/*
                    Ambient radial glow — a soft purple halo centered behind
                    the card. Pure CSS, zero JS cost, GPU composited.
                */}
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90vw',
                        maxWidth: 800,
                        height: '65vh',
                        background:
                            'radial-gradient(ellipse at center, rgba(91,35,255,0.13) 0%, transparent 68%)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                {/* Page heading */}
                <div
                    className="animate-fade-up"
                    style={{
                        textAlign: 'center',
                        marginBottom: 36,
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    {/* Pill label */}
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '5px 14px',
                            borderRadius: 999,
                            background: 'var(--color-primary-subtle)',
                            border: '1px solid var(--color-border-primary)',
                            color: 'var(--color-primary)',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase' as const,
                            marginBottom: 18,
                        }}
                    >
                        <ShieldIcon />
                        Identity Verification
                    </div>

                    <h1
                        style={{
                            fontSize: 'clamp(22px, 4vw, 30px)',
                            fontWeight: 800,
                            color: 'var(--color-text-primary)',
                            margin: 0,
                            letterSpacing: '-0.03em',
                            lineHeight: 1.2,
                        }}
                    >
                        Verify your identity
                    </h1>

                    <p
                        style={{
                            fontSize: 14,
                            color: 'var(--color-text-secondary)',
                            marginTop: 10,
                            marginBottom: 0,
                            lineHeight: 1.65,
                            maxWidth: 380,
                            marginLeft: 'auto',
                            marginRight: 'auto',
                        }}
                    >
                        A one-time process. Your information stays private
                        and is never stored without your consent.
                    </p>
                </div>

                {/* Verification card — constrained width, centred */}
                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        maxWidth: 580,
                    }}
                >
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
            <footer
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap' as const,
                    gap: '6px 14px',
                    padding: '14px 24px',
                    borderTop: '1px solid rgba(91,35,255,0.07)',
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    letterSpacing: '0.01em',
                }}
            >
                <span>End-to-end encrypted</span>
                <span aria-hidden="true" style={{ opacity: 0.35 }}>·</span>
                <span>Powered by Gracon</span>
                <span aria-hidden="true" style={{ opacity: 0.35 }}>·</span>
                <span>Your data is never shared</span>
            </footer>
        </div>
    );
}

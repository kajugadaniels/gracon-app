'use client';

/**
 * Step 2 card — X.509 digital certificate management.
 * Shows validity progress bar, certificate fields, PEM viewer, and revoke flow.
 */

import { useState } from 'react';
import type { CertificateResponse } from '@/api/signature/signature.api';
import { issueCertificate, revokeCertificate } from '@/api/signature/signature.api';

interface CertificateCardProps {
    certificate: CertificateResponse | null;
    hasKeyPair: boolean;
    onRefresh: () => void;
}

// ─── PEM block ────────────────────────────────────────────────────────────────

/**
 * Terminal-style collapsible PEM viewer with a copy button.
 * Collapsed by default to keep the card scannable.
 */
function PemBlock({ label, pem }: { label: string; pem: string }) {
    const [open, setOpen]     = useState(false);
    const [copied, setCopied] = useState(false);

    function copy() {
        navigator.clipboard.writeText(pem);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div style={{ marginBottom: 16 }}>
            <button
                onClick={() => setOpen(v => !v)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    fontSize: 12, fontWeight: 600,
                    color: open ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    transition: 'color 150ms ease',
                }}
            >
                <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 16, height: 16, borderRadius: 4,
                    background: open ? 'var(--color-primary-subtle)' : 'rgba(91,35,255,0.06)',
                    border: '1px solid var(--color-border)',
                    fontSize: 9, fontWeight: 800,
                    transition: 'transform 150ms ease, background 150ms ease',
                    transform: open ? 'rotate(90deg)' : 'none',
                }}>▶</span>
                {open ? `Hide ${label}` : `View ${label}`}
            </button>

            {open && (
                <div
                    className="animate-fade-in"
                    style={{
                        marginTop: 10, borderRadius: 'var(--radius-md)', overflow: 'hidden',
                        border: '1px solid var(--color-border)',
                        boxShadow: '0 2px 8px rgba(91,35,255,0.06)',
                    }}
                >
                    {/* Terminal title bar */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '7px 12px',
                        background: 'rgba(91,35,255,0.05)',
                        borderBottom: '1px solid var(--color-border)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {['rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)', 'rgba(16,185,129,0.7)'].map((c, i) => (
                                <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                            ))}
                            <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--color-text-muted)', marginLeft: 4 }}>
                                {label}
                            </span>
                        </div>
                        <button
                            onClick={copy}
                            style={{
                                padding: '2px 10px', borderRadius: 20, fontSize: 10.5, fontWeight: 600,
                                background: copied ? 'var(--color-success-subtle)' : 'rgba(255,255,255,0.8)',
                                border: `1px solid ${copied ? 'var(--color-success-border)' : 'var(--color-border)'}`,
                                color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)',
                                cursor: 'pointer', transition: 'all 150ms ease',
                            }}
                        >
                            {copied ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                    {/* PEM content */}
                    <pre style={{
                        margin: 0, padding: '12px 14px',
                        background: 'rgba(91,35,255,0.02)',
                        fontSize: 10, color: 'var(--color-text-secondary)',
                        fontFamily: 'monospace', lineHeight: 1.75,
                        overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                        maxHeight: 180, overflowY: 'auto',
                    }}>
                        {pem}
                    </pre>
                </div>
            )}
        </div>
    );
}

// ─── Validity progress bar ────────────────────────────────────────────────────

/**
 * Visual progress bar showing how much of the certificate's validity remains.
 * Color transitions from green → amber → red as expiry approaches.
 */
function ValidityBar({ notBefore, notAfter, daysRemaining }: {
    notBefore: string;
    notAfter: string;
    daysRemaining: number;
}) {
    const totalDays = Math.ceil(
        (new Date(notAfter).getTime() - new Date(notBefore).getTime()) / (1000 * 60 * 60 * 24),
    );
    const pct   = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));
    const color = daysRemaining < 30
        ? 'var(--color-error)'
        : daysRemaining < 90
          ? 'var(--color-warning)'
          : 'var(--color-success)';

    return (
        <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.07em' }}>
                    Certificate validity
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>
                    {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                </span>
            </div>
            <div style={{ height: 7, borderRadius: 4, background: 'rgba(91,35,255,0.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 700ms ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    {new Date(notBefore).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                    {new Date(notAfter).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
            </div>
        </div>
    );
}

// ─── Revoke confirmation ──────────────────────────────────────────────────────

/**
 * Danger panel confirming revocation — requires a written reason before proceeding.
 */
function RevokeConfirm({ reason, onChange, onConfirm, onCancel, loading }: {
    reason: string;
    onChange: (v: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div style={{
            marginTop: 16, padding: '16px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-error-subtle)',
            border: '1px solid var(--color-error-border)',
        }}>
            <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 500, color: 'var(--color-error)', lineHeight: 1.55 }}>
                Revoking is permanent. Existing signatures remain valid, but no new ones can be created until you re-issue.
            </p>
            <textarea
                value={reason}
                onChange={e => onChange(e.target.value)}
                placeholder="Reason for revocation (min 10 characters)…"
                rows={3}
                className="input-glass"
                style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={onCancel} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button
                    onClick={onConfirm}
                    disabled={loading}
                    style={{
                        flex: 1, padding: '10px 0', borderRadius: 9999,
                        background: 'var(--color-error)', color: '#fff',
                        border: 'none', fontSize: 12, fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        transition: 'opacity 150ms ease',
                    }}
                >
                    {loading ? 'Revoking…' : 'Confirm Revoke'}
                </button>
            </div>
        </div>
    );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function CertificateCard({ certificate, hasKeyPair, onRefresh }: CertificateCardProps) {
    const [loading, setLoading]       = useState(false);
    const [showRevoke, setShowRevoke] = useState(false);
    const [revokeReason, setReason]   = useState('');
    const [error, setError]           = useState<string | null>(null);

    const isActive = !!certificate && !certificate.isRevoked && !certificate.isExpired;

    const statusColor = certificate?.isRevoked
        ? 'var(--color-error)'
        : certificate?.isExpired
          ? 'var(--color-warning)'
          : isActive
            ? 'var(--color-success)'
            : 'var(--color-primary)';

    const statusLabel = certificate?.isRevoked
        ? 'Revoked'
        : certificate?.isExpired
          ? 'Expired'
          : isActive
            ? 'Active'
            : 'Step 2';

    async function handleIssue() {
        setLoading(true); setError(null);
        try { await issueCertificate(2); onRefresh(); }
        catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to issue certificate'); }
        finally { setLoading(false); }
    }

    async function handleRevoke() {
        if (revokeReason.trim().length < 10) { setError('Reason must be at least 10 characters.'); return; }
        setLoading(true); setError(null);
        try { await revokeCertificate(revokeReason.trim()); setShowRevoke(false); setReason(''); onRefresh(); }
        catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to revoke certificate'); }
        finally { setLoading(false); }
    }

    return (
        <div className="glass-strong" style={{ borderRadius: 'var(--radius-xl)', padding: 28 }}>

            {/* ── Header ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                        background: isActive
                            ? 'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(5,150,105,0.06))'
                            : 'linear-gradient(135deg, var(--color-primary-subtle), rgba(91,35,255,0.04))',
                        border: `1.5px solid ${isActive ? 'var(--color-success-border)' : 'var(--color-border-primary)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isActive
                            ? '0 4px 14px rgba(5,150,105,0.12)'
                            : '0 4px 14px rgba(91,35,255,0.08)',
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                            stroke={isActive ? 'var(--color-success)' : 'var(--color-primary)'}
                            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <polyline points="9 15 11 17 15 13" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                                Digital Certificate
                            </h3>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                            X.509 · Trusted by Gracon · 2-year validity
                        </p>
                    </div>
                </div>
                <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                    color: statusColor,
                    background: `color-mix(in srgb, ${statusColor} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${statusColor} 30%, transparent)`,
                    borderRadius: 20, padding: '3px 10px', flexShrink: 0,
                    textTransform: 'uppercase' as const,
                }}>
                    {statusLabel}
                </span>
            </div>

            {/* ── Error ──────────────────────────────────────────── */}
            {error && (
                <div style={{ marginBottom: 18, padding: '11px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)', fontSize: 13, color: 'var(--color-error)', lineHeight: 1.5 }}>
                    {error}
                </div>
            )}

            {isActive ? (
                <>
                    {/* ── Validity bar ─────────────────────────────── */}
                    <ValidityBar
                        notBefore={certificate!.notBefore}
                        notAfter={certificate!.notAfter}
                        daysRemaining={certificate!.daysRemaining}
                    />

                    {/* ── Certificate fields ───────────────────────── */}
                    <div style={{
                        border: '1px solid rgba(91,35,255,0.10)',
                        borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 18,
                    }}>
                        {[
                            { label: 'Subject (CN)',   value: certificate!.subjectCN },
                            { label: 'Serial Number', value: certificate!.serialNumber.slice(0, 24) + '…', mono: true },
                            { label: 'Valid From',     value: new Date(certificate!.notBefore).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                            { label: 'Expires',       value: new Date(certificate!.notAfter).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                        ].map(({ label, value, mono }, i, arr) => (
                            <div key={label} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 14px',
                                background: i % 2 === 0 ? 'rgba(91,35,255,0.025)' : 'transparent',
                                borderBottom: i < arr.length - 1 ? '1px solid rgba(91,35,255,0.07)' : 'none',
                            }}>
                                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
                                <span style={{
                                    fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)',
                                    fontFamily: mono ? 'monospace' : undefined,
                                }}>{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* ── Certificate PEM ──────────────────────────── */}
                    <PemBlock label="Certificate (PEM)" pem={certificate!.certificatePem} />

                    {/* ── Revoke ───────────────────────────────────── */}
                    {!showRevoke ? (
                        <button
                            onClick={() => setShowRevoke(true)}
                            style={{
                                marginTop: 4, width: '100%', padding: '10px 0', borderRadius: 9999,
                                background: 'var(--color-error-subtle)',
                                border: '1px solid var(--color-error-border)',
                                fontSize: 12, fontWeight: 500, color: 'var(--color-error)',
                                cursor: 'pointer', transition: 'background 150ms ease',
                            }}
                        >
                            Revoke Certificate
                        </button>
                    ) : (
                        <RevokeConfirm
                            reason={revokeReason}
                            onChange={setReason}
                            onConfirm={handleRevoke}
                            onCancel={() => { setShowRevoke(false); setReason(''); }}
                            loading={loading}
                        />
                    )}
                </>
            ) : (
                /* ── Empty / revoked state ───────────────────────── */
                <div>
                    {certificate?.isRevoked && (
                        <div style={{ marginBottom: 18, padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)', fontSize: 13, color: 'var(--color-error)', lineHeight: 1.55 }}>
                            This certificate has been revoked. Issue a new one to resume signing.
                        </div>
                    )}

                    {!hasKeyPair ? (
                        <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--color-text-muted)' }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: '50%', margin: '0 auto 14px',
                                background: 'rgba(91,35,255,0.06)',
                                border: '1.5px dashed rgba(91,35,255,0.20)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                                Complete Step 1 first — a key pair is required before a certificate can be issued.
                            </p>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                                background: 'var(--color-primary-subtle)',
                                border: '1.5px dashed var(--color-border-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="12" y1="18" x2="12" y2="12" />
                                    <line x1="9" y1="15" x2="15" y2="15" />
                                </svg>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6, lineHeight: 1.6 }}>
                                No certificate yet
                            </p>
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.6, maxWidth: 360, margin: '0 auto 24px' }}>
                                Your X.509 certificate binds your verified identity to your public key. Anyone can use it to verify your signatures without contacting you.
                            </p>
                            <button onClick={handleIssue} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                                {loading ? 'Issuing…' : 'Issue Certificate (2-year validity)'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

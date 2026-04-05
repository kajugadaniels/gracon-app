'use client';

// Step 2 card — X.509 digital certificate management.
// Shows validity expiry bar, PEM toggle, and revoke confirmation.

import { useState } from 'react';
import type { CertificateResponse } from '@/api/signature/signature.api';
import { issueCertificate, revokeCertificate } from '@/api/signature/signature.api';

interface CertificateCardProps {
    certificate: CertificateResponse | null;
    hasKeyPair: boolean;
    onRefresh: () => void;
}

// ─── Validity progress bar ────────────────────────────────────────────────────

function ValidityBar({ notBefore, notAfter, daysRemaining }: { notBefore: string; notAfter: string; daysRemaining: number }) {
    const totalDays = Math.ceil(
        (new Date(notAfter).getTime() - new Date(notBefore).getTime()) / (1000 * 60 * 60 * 24)
    );
    const pct   = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));
    const color = daysRemaining < 30 ? 'var(--color-error)' : daysRemaining < 90 ? 'var(--color-warning)' : 'var(--color-success)';

    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Certificate validity
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color }}>
                    {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(91,35,255,0.08)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 600ms ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
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

function RevokeConfirm({ reason, onChange, onConfirm, onCancel, loading }: {
    reason: string;
    onChange: (v: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div style={{ marginTop: 16, padding: 16, borderRadius: 'var(--radius-md)', background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)' }}>
            <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 500, color: 'var(--color-error)', lineHeight: 1.5 }}>
                Revoking is permanent. All signatures linked to this certificate remain valid, but no new signatures can be created until you re-issue.
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
                <button onClick={onConfirm} disabled={loading} style={{
                    flex: 1, padding: '10px 0', borderRadius: 9999,
                    background: 'var(--color-error)', color: '#fff',
                    border: 'none', fontSize: 12, fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                }}>
                    {loading ? 'Revoking…' : 'Confirm Revoke'}
                </button>
            </div>
        </div>
    );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function CertificateCard({ certificate, hasKeyPair, onRefresh }: CertificateCardProps) {
    const [loading, setLoading]         = useState(false);
    const [showPem, setShowPem]         = useState(false);
    const [showRevoke, setShowRevoke]   = useState(false);
    const [revokeReason, setReason]     = useState('');
    const [error, setError]             = useState<string | null>(null);

    const isActive = !!certificate && !certificate.isRevoked;

    const statusColor = certificate?.isRevoked
        ? 'var(--color-error)'
        : certificate?.isExpired
            ? 'var(--color-warning)'
            : isActive
                ? 'var(--color-success)'
                : undefined;

    const statusLabel = certificate?.isRevoked
        ? 'Revoked'
        : certificate?.isExpired
            ? 'Expired'
            : isActive
                ? 'Active'
                : null;

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
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 28, boxShadow: 'var(--glass-shadow)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: 'var(--color-primary-subtle)', border: '1px solid var(--color-border-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    }}>🎖️</div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                Digital Certificate
                            </h3>
                            {statusLabel && statusColor && (
                                <span style={{
                                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                                    color: statusColor,
                                    background: `${statusColor}18`,
                                    border: `1px solid ${statusColor}40`,
                                    borderRadius: 20, padding: '2px 8px',
                                }}>
                                    {statusLabel.toUpperCase()}
                                </span>
                            )}
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                            X.509 identity certificate — trusted by Gracon 360
                        </p>
                    </div>
                </div>
                <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    color: 'var(--color-primary)', background: 'var(--color-primary-subtle)',
                    border: '1px solid var(--color-border-primary)', borderRadius: 20,
                    padding: '3px 10px', flexShrink: 0,
                }}>STEP 2</span>
            </div>

            {/* Error */}
            {error && (
                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)', fontSize: 13, color: 'var(--color-error)' }}>
                    {error}
                </div>
            )}

            {isActive ? (
                <>
                    {/* Validity bar */}
                    <ValidityBar notBefore={certificate!.notBefore} notAfter={certificate!.notAfter} daysRemaining={certificate!.daysRemaining} />

                    {/* Certificate fields */}
                    <div style={{ border: '1px solid rgba(91,35,255,0.10)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 16 }}>
                        {[
                            { label: 'Subject (CN)',    value: certificate!.subjectCN },
                            { label: 'Serial Number',  value: certificate!.serialNumber.slice(0, 20) + '…', mono: true },
                            { label: 'Valid From',      value: new Date(certificate!.notBefore).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                            { label: 'Expires',        value: new Date(certificate!.notAfter).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                        ].map(({ label, value, mono }, i, arr) => (
                            <div key={label} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 14px',
                                background: i % 2 === 0 ? 'rgba(91,35,255,0.02)' : 'transparent',
                                borderBottom: i < arr.length - 1 ? '1px solid rgba(91,35,255,0.07)' : 'none',
                            }}>
                                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: mono ? 'monospace' : undefined }}>{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* PEM toggle */}
                    <button onClick={() => setShowPem(v => !v)} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        fontSize: 12, color: 'var(--color-primary)', fontWeight: 500,
                        display: 'flex', alignItems: 'center', gap: 4, marginBottom: showPem ? 10 : 0,
                    }}>
                        <span style={{ fontSize: 10, transition: 'transform 150ms', transform: showPem ? 'rotate(90deg)' : 'none' }}>▶</span>
                        {showPem ? 'Hide certificate PEM' : 'Show certificate PEM'}
                    </button>
                    {showPem && (
                        <div style={{ position: 'relative', marginBottom: 16 }}>
                            <pre style={{
                                margin: 0, padding: '12px 14px', borderRadius: 'var(--radius-md)',
                                background: 'rgba(91,35,255,0.03)', border: '1px solid var(--color-border)',
                                fontSize: 10, color: 'var(--color-text-secondary)',
                                overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                                maxHeight: 160, overflowY: 'auto', fontFamily: 'monospace', lineHeight: 1.7,
                            }}>
                                {certificate!.certificatePem}
                            </pre>
                            <button onClick={() => navigator.clipboard.writeText(certificate!.certificatePem)} style={{
                                position: 'absolute', top: 8, right: 8,
                                padding: '2px 8px', borderRadius: 6, fontSize: 10, cursor: 'pointer',
                                background: 'rgba(255,255,255,0.9)', border: '1px solid var(--color-border)',
                                color: 'var(--color-text-secondary)',
                            }}>Copy</button>
                        </div>
                    )}

                    {/* Revoke */}
                    {!showRevoke ? (
                        <button onClick={() => setShowRevoke(true)} style={{
                            width: '100%', padding: '9px 0', borderRadius: 9999,
                            background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)',
                            fontSize: 12, fontWeight: 500, color: 'var(--color-error)', cursor: 'pointer',
                        }}>
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
                <div>
                    {certificate?.isRevoked && (
                        <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)', fontSize: 13, color: 'var(--color-error)' }}>
                            This certificate has been revoked. Generate a new key pair and issue a fresh certificate to continue signing.
                        </div>
                    )}
                    {!hasKeyPair ? (
                        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                            Complete Step 1 first — you need a key pair before a certificate can be issued.
                        </p>
                    ) : (
                        <>
                            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                                Your X.509 certificate binds your verified identity to your public key. Anyone can use it to verify your signatures without contacting you.
                            </p>
                            <button onClick={handleIssue} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                                {loading ? 'Issuing Certificate…' : 'Issue Certificate (2-year validity)'}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

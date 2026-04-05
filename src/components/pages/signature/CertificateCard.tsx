'use client';

import { useState } from 'react';
import type { CertificateResponse } from '@/api/signature/signature.api';
import { issueCertificate, revokeCertificate } from '@/api/signature/signature.api';

interface CertificateCardProps {
    certificate: CertificateResponse | null;
    hasKeyPair: boolean;
    onRefresh: () => void;
}

export function CertificateCard({
    certificate,
    hasKeyPair,
    onRefresh,
}: CertificateCardProps) {
    const [loading, setLoading] = useState(false);
    const [showPem, setShowPem] = useState(false);
    const [showRevoke, setShowRevoke] = useState(false);
    const [revokeReason, setRevokeReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    async function handleIssue() {
        setLoading(true);
        setError(null);
        try {
            await issueCertificate(2);
            onRefresh();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to issue certificate';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    async function handleRevoke() {
        if (revokeReason.trim().length < 10) {
            setError('Please provide a reason of at least 10 characters.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await revokeCertificate(revokeReason.trim());
            setShowRevoke(false);
            setRevokeReason('');
            onRefresh();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to revoke certificate';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    const statusColor = certificate?.isRevoked
        ? 'var(--error)'
        : certificate?.isExpired
            ? 'var(--warning)'
            : 'var(--success)';

    const statusLabel = certificate?.isRevoked
        ? 'Revoked'
        : certificate?.isExpired
            ? 'Expired'
            : `Valid · ${certificate?.daysRemaining} days remaining`;

    return (
        <div
            style={{
                background: 'var(--glass-card)',
                backdropFilter: 'blur(var(--glass-card-blur))',
                border: '1px solid var(--glass-card-border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--glass-card-shadow)',
                padding: 28,
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div
                    style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'var(--primary-glass)', border: '1px solid var(--primary-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}
                >
                    📜
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                        Digital Certificate
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                        X.509 identity certificate — trusted by Gracon 360
                    </p>
                </div>
                {certificate && (
                    <div
                        style={{
                            marginLeft: 'auto',
                            padding: '4px 12px', borderRadius: 20,
                            background: `${statusColor}20`,
                            border: `1px solid ${statusColor}50`,
                            fontSize: 12, fontWeight: 600, color: statusColor,
                        }}
                    >
                        {statusLabel}
                    </div>
                )}
            </div>

            {error && (
                <div
                    style={{
                        background: 'var(--error-glass)', border: '1px solid var(--error-border)',
                        borderRadius: 'var(--radius-md)', padding: '10px 14px',
                        fontSize: 13, color: 'var(--error-text)', marginBottom: 16,
                    }}
                >
                    {error}
                </div>
            )}

            {certificate && !certificate.isRevoked ? (
                <>
                    {[
                        { label: 'Subject (CN)', value: certificate.subjectCN },
                        { label: 'Serial Number', value: certificate.serialNumber.slice(0, 16) + '…' },
                        { label: 'Valid From', value: new Date(certificate.notBefore).toLocaleDateString() },
                        { label: 'Expires', value: new Date(certificate.notAfter).toLocaleDateString() },
                    ].map(({ label, value }) => (
                        <div
                            key={label}
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 0', borderBottom: '1px solid var(--glass-card-border)',
                            }}
                        >
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', fontFamily: label === 'Serial Number' ? 'monospace' : undefined }}>
                                {value}
                            </span>
                        </div>
                    ))}

                    {/* PEM toggle */}
                    <div style={{ marginTop: 16 }}>
                        <button
                            onClick={() => setShowPem(v => !v)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 13, color: 'var(--primary-text)',
                                padding: 0, textDecoration: 'underline',
                            }}
                        >
                            {showPem ? 'Hide certificate PEM' : 'Show certificate PEM'}
                        </button>
                        {showPem && (
                            <div style={{ position: 'relative', marginTop: 12 }}>
                                <pre
                                    style={{
                                        padding: 14, borderRadius: 'var(--radius-md)',
                                        background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-card-border)',
                                        fontSize: 10, color: 'var(--text-secondary)',
                                        overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                                        maxHeight: 160, overflowY: 'auto',
                                    }}
                                >
                                    {certificate.certificatePem}
                                </pre>
                                <button
                                    onClick={() => navigator.clipboard.writeText(certificate.certificatePem)}
                                    style={{
                                        position: 'absolute', top: 8, right: 8,
                                        background: 'var(--glass-interactive)',
                                        border: '1px solid var(--glass-interactive-border)',
                                        borderRadius: 6, padding: '3px 8px',
                                        fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer',
                                    }}
                                >
                                    Copy
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Revoke */}
                    <div style={{ marginTop: 20 }}>
                        {!showRevoke ? (
                            <button
                                onClick={() => setShowRevoke(true)}
                                style={{
                                    background: 'var(--error-glass)', border: '1px solid var(--error-border)',
                                    borderRadius: 'var(--radius-md)', padding: '9px 18px',
                                    fontSize: 13, fontWeight: 500, color: 'var(--error-text)',
                                    cursor: 'pointer', width: '100%',
                                }}
                            >
                                Revoke Certificate
                            </button>
                        ) : (
                            <div
                                style={{
                                    background: 'var(--error-glass)', border: '1px solid var(--error-border)',
                                    borderRadius: 'var(--radius-md)', padding: 16,
                                }}
                            >
                                <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--error-text)', fontWeight: 500 }}>
                                    ⚠️ Revoking is permanent and irreversible. You will need to generate a new key pair and certificate.
                                </p>
                                <textarea
                                    value={revokeReason}
                                    onChange={e => setRevokeReason(e.target.value)}
                                    placeholder="Reason for revocation (min 10 characters)…"
                                    rows={3}
                                    style={{
                                        width: '100%', padding: 10, borderRadius: 'var(--radius-md)',
                                        background: 'var(--glass-interactive)',
                                        border: '1px solid var(--glass-interactive-border)',
                                        color: 'var(--text-primary)', fontSize: 13, resize: 'vertical',
                                        outline: 'none', fontFamily: 'var(--font-sans)',
                                    }}
                                />
                                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                    <button
                                        onClick={() => { setShowRevoke(false); setRevokeReason(''); }}
                                        style={{
                                            flex: 1, background: 'var(--glass-interactive)',
                                            border: '1px solid var(--glass-interactive-border)',
                                            borderRadius: 'var(--radius-md)', padding: '9px 0',
                                            fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRevoke}
                                        disabled={loading}
                                        style={{
                                            flex: 1, background: 'var(--error-glass)',
                                            border: '1px solid var(--error-border)',
                                            borderRadius: 'var(--radius-md)', padding: '9px 0',
                                            fontSize: 13, fontWeight: 600, color: 'var(--error-text)',
                                            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                                        }}
                                    >
                                        {loading ? 'Revoking…' : 'Confirm Revoke'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div>
                    {certificate?.isRevoked ? (
                        <div
                            style={{
                                background: 'var(--error-glass)', border: '1px solid var(--error-border)',
                                borderRadius: 'var(--radius-md)', padding: '12px 16px',
                                fontSize: 13, color: 'var(--error-text)', marginBottom: 20,
                            }}
                        >
                            This certificate has been revoked. Generate a new key pair and issue a new certificate to continue signing.
                        </div>
                    ) : null}

                    {!hasKeyPair ? (
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                            Generate a key pair first before issuing a certificate.
                        </p>
                    ) : (
                        <>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                                Your X.509 certificate binds your verified identity to your public key. Third parties use it to verify everything you sign.
                            </p>
                            <button
                                onClick={handleIssue}
                                disabled={loading}
                                className="btn-primary"
                                style={{ width: '100%' }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                        <span className="btn-spinner" /> Issuing Certificate…
                                    </span>
                                ) : 'Issue Certificate'}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
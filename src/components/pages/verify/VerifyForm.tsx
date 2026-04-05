'use client';

import { useState } from 'react';
import { verifySignature } from '@/api/signature/signature.api';
import type { VerifyResponse } from '@/api/signature/signature.api';

export function VerifyForm() {
    const [documentHash, setDocumentHash] = useState('');
    const [signatureBytes, setSignatureBytes] = useState('');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VerifyResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleVerify() {
        setError(null);
        setResult(null);

        const hash = documentHash.trim().toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(hash)) {
            setError('Document hash must be exactly 64 hex characters (SHA-256).');
            return;
        }
        if (!signatureBytes.trim()) {
            setError('Please paste the signature bytes.');
            return;
        }
        if (!userId.trim()) {
            setError('Please enter the signer\'s user ID.');
            return;
        }

        setLoading(true);
        try {
            const res = await verifySignature({
                documentHash: hash,
                signatureBytes: signatureBytes.trim(),
                userId: userId.trim(),
            });
            setResult(res);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Verification request failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    function reset() {
        setDocumentHash('');
        setSignatureBytes('');
        setUserId('');
        setResult(null);
        setError(null);
    }

    return (
        <div
            style={{
                background: 'var(--glass-card)',
                backdropFilter: 'blur(var(--glass-card-blur))',
                border: '1px solid var(--glass-card-border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--glass-card-shadow)',
                padding: 36,
                width: '100%',
                maxWidth: 560,
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Verify a Signature
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Paste the signature bytes, document hash, and signer ID to confirm authenticity. No account required.
                </p>
            </div>

            {/* Fields */}
            {[
                {
                    id: 'hash',
                    label: 'Document Hash (SHA-256)',
                    value: documentHash,
                    onChange: setDocumentHash,
                    placeholder: 'e3b0c44298fc1c149afb4c8996fb924…',
                    mono: true,
                },
                {
                    id: 'sig',
                    label: 'Signature Bytes (base64)',
                    value: signatureBytes,
                    onChange: setSignatureBytes,
                    placeholder: 'MEUCIQDk3…',
                    mono: true,
                },
                {
                    id: 'uid',
                    label: 'Signer User ID',
                    value: userId,
                    onChange: setUserId,
                    placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                    mono: true,
                },
            ].map(({ id, label, value, onChange, placeholder, mono }) => (
                <div key={id} style={{ marginBottom: 16 }}>
                    <label
                        htmlFor={id}
                        style={{
                            display: 'block', fontSize: 12, color: 'var(--text-muted)',
                            marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}
                    >
                        {label}
                    </label>
                    <input
                        id={id}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={placeholder}
                        style={{
                            width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                            background: 'var(--glass-interactive)',
                            border: '1px solid var(--glass-interactive-border)',
                            color: 'var(--text-primary)', fontSize: 13,
                            fontFamily: mono ? 'monospace' : 'var(--font-sans)',
                            outline: 'none',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'var(--primary-border)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--glass-interactive-border)')}
                    />
                </div>
            ))}

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

            {/* Result */}
            {result && (
                <div
                    style={{
                        background: result.valid ? 'var(--success-glass)' : 'var(--error-glass)',
                        border: `1px solid ${result.valid ? 'var(--success-border)' : 'var(--error-border)'}`,
                        borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: result.valid ? 16 : 0 }}>
                        <span style={{ fontSize: 28 }}>{result.valid ? '✅' : '❌'}</span>
                        <div>
                            <p
                                style={{
                                    margin: 0, fontSize: 16, fontWeight: 700,
                                    color: result.valid ? 'var(--success-text)' : 'var(--error-text)',
                                }}
                            >
                                {result.valid ? 'Signature is Valid' : 'Signature is Invalid'}
                            </p>
                            {!result.valid && result.reason && (
                                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--error-text)', opacity: 0.8 }}>
                                    {result.reason}
                                </p>
                            )}
                        </div>
                    </div>

                    {result.valid && result.signer && (
                        <div style={{ borderTop: '1px solid var(--success-border)', paddingTop: 16 }}>
                            {[
                                { label: 'Signed by', value: result.signer.subjectCN },
                                { label: 'Certificate', value: result.signer.certificateId.slice(0, 16) + '…' },
                                { label: 'Valid until', value: new Date(result.signer.notAfter).toLocaleDateString() },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        padding: '6px 0', borderBottom: '1px solid rgba(52,211,153,0.15)',
                                    }}
                                >
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--success-text)' }}>
                                        {value}
                                    </span>
                                </div>
                            ))}

                            <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(52,211,153,0.08)', borderRadius: 8 }}>
                                <p style={{ margin: 0, fontSize: 12, color: 'var(--success-text)', lineHeight: 1.5 }}>
                                    This document has not been modified since it was signed. The document hash matches the signature exactly.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {result ? (
                <button
                    onClick={reset}
                    style={{
                        width: '100%', background: 'var(--glass-interactive)',
                        border: '1px solid var(--glass-interactive-border)',
                        borderRadius: 'var(--radius-md)', padding: '11px 0',
                        fontSize: 14, color: 'var(--text-secondary)', cursor: 'pointer',
                    }}
                >
                    Verify Another Signature
                </button>
            ) : (
                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="btn-primary"
                    style={{ width: '100%' }}
                >
                    {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                            <span className="btn-spinner" /> Verifying…
                        </span>
                    ) : 'Verify Signature'}
                </button>
            )}
        </div>
    );
}
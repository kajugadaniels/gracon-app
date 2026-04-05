'use client';

import { useState } from 'react';
import type { KeyPairResponse, KeyAlgorithm } from '@/api/signature/signature.api';
import { generateKeyPair, rotateKeyPair } from '@/api/signature/signature.api';

interface KeyPairCardProps {
    keyPair: KeyPairResponse | null;
    onRefresh: () => void;
}

export function KeyPairCard({ keyPair, onRefresh }: KeyPairCardProps) {
    const [loading, setLoading] = useState(false);
    const [algorithm, setAlgorithm] = useState<KeyAlgorithm>('RSA_2048');
    const [showPem, setShowPem] = useState(false);
    const [showRotate, setShowRotate] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleGenerate() {
        setLoading(true);
        setError(null);
        try {
            await generateKeyPair(algorithm);
            onRefresh();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to generate key pair';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    async function handleRotate() {
        setLoading(true);
        setError(null);
        try {
            await rotateKeyPair(algorithm);
            setShowRotate(false);
            onRefresh();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to rotate key pair';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    function copyFingerprint() {
        if (keyPair?.fingerprint) {
            navigator.clipboard.writeText(keyPair.fingerprint);
        }
    }

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
                        background: 'var(--primary-glass)',
                        border: '1px solid var(--primary-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18,
                    }}
                >
                    🔑
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                        Cryptographic Key Pair
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                        Your private key is encrypted and stored securely. It is never returned.
                    </p>
                </div>
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

            {keyPair ? (
                <>
                    {/* Key info rows */}
                    {[
                        { label: 'Algorithm', value: keyPair.algorithm.replace('_', '-') },
                        { label: 'Created', value: new Date(keyPair.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                    ].map(({ label, value }) => (
                        <div
                            key={label}
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 0', borderBottom: '1px solid var(--glass-card-border)',
                            }}
                        >
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{value}</span>
                        </div>
                    ))}

                    {/* Fingerprint row with copy */}
                    <div
                        style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 0', borderBottom: '1px solid var(--glass-card-border)',
                        }}
                    >
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Fingerprint</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                                style={{
                                    fontSize: 11, fontFamily: 'monospace',
                                    color: 'var(--text-secondary)', maxWidth: 180,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}
                            >
                                {keyPair.fingerprint.slice(0, 24)}…
                            </span>
                            <button
                                onClick={copyFingerprint}
                                style={{
                                    background: 'var(--glass-interactive)', border: '1px solid var(--glass-interactive-border)',
                                    borderRadius: 6, padding: '3px 8px', fontSize: 11,
                                    color: 'var(--text-secondary)', cursor: 'pointer',
                                }}
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Public key toggle */}
                    <div style={{ marginTop: 16 }}>
                        <button
                            onClick={() => setShowPem(v => !v)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 13, color: 'var(--primary-text)',
                                padding: 0, textDecoration: 'underline',
                            }}
                        >
                            {showPem ? 'Hide public key' : 'Show public key (PEM)'}
                        </button>
                        {showPem && (
                            <pre
                                style={{
                                    marginTop: 12, padding: 14, borderRadius: 'var(--radius-md)',
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-card-border)',
                                    fontSize: 10, color: 'var(--text-secondary)',
                                    overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                                    maxHeight: 160, overflowY: 'auto',
                                }}
                            >
                                {keyPair.publicKey}
                            </pre>
                        )}
                    </div>

                    {/* Rotate section */}
                    <div style={{ marginTop: 20 }}>
                        {!showRotate ? (
                            <button
                                onClick={() => setShowRotate(true)}
                                style={{
                                    background: 'var(--error-glass)', border: '1px solid var(--error-border)',
                                    borderRadius: 'var(--radius-md)', padding: '9px 18px',
                                    fontSize: 13, fontWeight: 500, color: 'var(--error-text)',
                                    cursor: 'pointer', width: '100%',
                                }}
                            >
                                Rotate Key Pair
                            </button>
                        ) : (
                            <div
                                style={{
                                    background: 'var(--error-glass)', border: '1px solid var(--error-border)',
                                    borderRadius: 'var(--radius-md)', padding: 16,
                                }}
                            >
                                <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--error-text)', fontWeight: 500 }}>
                                    ⚠️ Rotating your key pair will permanently revoke your current certificate. You will need to issue a new one.
                                </p>
                                <AlgorithmSelector value={algorithm} onChange={setAlgorithm} />
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <button
                                        onClick={() => setShowRotate(false)}
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
                                        onClick={handleRotate}
                                        disabled={loading}
                                        style={{
                                            flex: 1, background: 'var(--error-glass)',
                                            border: '1px solid var(--error-border)',
                                            borderRadius: 'var(--radius-md)', padding: '9px 0',
                                            fontSize: 13, fontWeight: 600, color: 'var(--error-text)',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.6 : 1,
                                        }}
                                    >
                                        {loading ? 'Rotating…' : 'Confirm Rotate'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* No key pair yet */
                <div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                        You do not have a key pair yet. Generate one to start issuing certificates and signing documents.
                    </p>
                    <AlgorithmSelector value={algorithm} onChange={setAlgorithm} />
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="btn-primary"
                        style={{ marginTop: 16, width: '100%' }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                <span className="btn-spinner" /> Generating Key Pair…
                            </span>
                        ) : 'Generate Key Pair'}
                    </button>
                </div>
            )}
        </div>
    );
}

function AlgorithmSelector({
    value,
    onChange,
}: {
    value: KeyAlgorithm;
    onChange: (v: KeyAlgorithm) => void;
}) {
    return (
        <div>
            <p style={{ margin: '0 0 8px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Algorithm
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
                {(['RSA_2048', 'ED25519'] as KeyAlgorithm[]).map((alg) => (
                    <button
                        key={alg}
                        onClick={() => onChange(alg)}
                        style={{
                            flex: 1, padding: '9px 0', borderRadius: 'var(--radius-md)',
                            border: `1px solid ${value === alg ? 'var(--primary-border)' : 'var(--glass-card-border)'}`,
                            background: value === alg ? 'var(--primary-glass)' : 'var(--glass-interactive)',
                            color: value === alg ? 'var(--primary-text)' : 'var(--text-secondary)',
                            fontSize: 13, fontWeight: value === alg ? 600 : 400,
                            cursor: 'pointer',
                            transition: 'all 150ms ease',
                        }}
                    >
                        {alg.replace('_', '-')}
                    </button>
                ))}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                {value === 'RSA_2048'
                    ? 'RSA-2048 — maximum compatibility with banks and government systems'
                    : 'Ed25519 — faster, shorter keys, ideal for modern integrations'}
            </p>
        </div>
    );
}

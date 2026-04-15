'use client';

// Step 1 card — cryptographic key pair management.
// Algorithm is fixed to RSA-2048 (maximum compatibility with banks and
// government systems). Private key is server-side encrypted and never returned.

import { useState } from 'react';
import type { KeyPairResponse } from '@/api/signature/signature.api';
import { generateKeyPair, rotateKeyPair } from '@/api/signature/signature.api';

/** RSA-2048 is the fixed algorithm — not user-selectable. */
const KEY_ALGORITHM = 'RSA_2048' as const;

interface KeyPairCardProps {
    keyPair: KeyPairResponse | null;
    onRefresh: () => void;
}

// ─── Rotate confirm ───────────────────────────────────────────────────────────

function RotateConfirm({ onConfirm, onCancel, loading }: {
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div style={{
            marginTop: 16, padding: 16, borderRadius: 'var(--radius-md)',
            background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)',
        }}>
            <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 500, color: 'var(--color-error)', lineHeight: 1.5 }}>
                Rotating revokes your current certificate permanently. You will need to issue a new one before you can sign again.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
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
                    }}
                >
                    {loading ? 'Rotating…' : 'Confirm Rotate'}
                </button>
            </div>
        </div>
    );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function KeyPairCard({ keyPair, onRefresh }: KeyPairCardProps) {
    const [loading, setLoading]       = useState(false);
    const [showRotate, setShowRotate] = useState(false);
    const [copied, setCopied]         = useState(false);
    const [error, setError]           = useState<string | null>(null);

    async function handleGenerate() {
        setLoading(true); setError(null);
        try { await generateKeyPair(KEY_ALGORITHM); onRefresh(); }
        catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to generate key pair'); }
        finally { setLoading(false); }
    }

    async function handleRotate() {
        setLoading(true); setError(null);
        try { await rotateKeyPair(KEY_ALGORITHM); setShowRotate(false); onRefresh(); }
        catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to rotate key pair'); }
        finally { setLoading(false); }
    }

    function copyFingerprint() {
        if (!keyPair?.fingerprint) return;
        navigator.clipboard.writeText(keyPair.fingerprint);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                    }}>🔑</div>
                    <div>
                        <h3 style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            Cryptographic Key Pair
                        </h3>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                            RSA-2048 · Private key encrypted server-side
                        </p>
                    </div>
                </div>
                <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    color: 'var(--color-primary)', background: 'var(--color-primary-subtle)',
                    border: '1px solid var(--color-border-primary)', borderRadius: 20,
                    padding: '3px 10px', flexShrink: 0,
                }}>STEP 1</span>
            </div>

            {/* Error */}
            {error && (
                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)', fontSize: 13, color: 'var(--color-error)' }}>
                    {error}
                </div>
            )}

            {keyPair ? (
                <>
                    {/* Key details */}
                    {[
                        { label: 'Algorithm', value: keyPair.algorithm.replace('_', '-') },
                        { label: 'Created',   value: new Date(keyPair.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(91,35,255,0.07)' }}>
                            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</span>
                        </div>
                    ))}

                    {/* Fingerprint */}
                    <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(91,35,255,0.07)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>Fingerprint</span>
                            <button
                                onClick={copyFingerprint}
                                style={{
                                    padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                                    background: copied ? 'var(--color-success-subtle)' : 'rgba(91,35,255,0.06)',
                                    border: `1px solid ${copied ? 'var(--color-success-border)' : 'var(--color-border)'}`,
                                    color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)',
                                    cursor: 'pointer', transition: 'all 150ms ease',
                                }}
                            >
                                {copied ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                        <code style={{
                            display: 'block', fontSize: 10.5, fontFamily: 'monospace',
                            color: 'var(--color-text-secondary)', lineHeight: 1.6,
                            wordBreak: 'break-all', background: 'rgba(91,35,255,0.04)',
                            padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)',
                        }}>
                            {keyPair.fingerprint}
                        </code>
                    </div>

                    {/* Rotate */}
                    {!showRotate ? (
                        <button
                            onClick={() => setShowRotate(true)}
                            style={{
                                marginTop: 20, width: '100%', padding: '9px 0', borderRadius: 9999,
                                background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)',
                                fontSize: 12, fontWeight: 500, color: 'var(--color-error)', cursor: 'pointer',
                            }}
                        >
                            Rotate Key Pair
                        </button>
                    ) : (
                        <RotateConfirm
                            onConfirm={handleRotate}
                            onCancel={() => setShowRotate(false)}
                            loading={loading}
                        />
                    )}
                </>
            ) : (
                <>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                        Generate your RSA-2048 key pair to begin. Your private key is encrypted with a server-side master secret and is never accessible after generation.
                    </p>
                    <button onClick={handleGenerate} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                        {loading ? 'Generating Key Pair…' : 'Generate Key Pair'}
                    </button>
                </>
            )}
        </div>
    );
}

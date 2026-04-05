'use client';

// Step 1 card — cryptographic key pair management.
// Handles generate and rotate flows with confirmation gate on rotate.

import { useState } from 'react';
import type { KeyPairResponse, KeyAlgorithm } from '@/api/signature/signature.api';
import { generateKeyPair, rotateKeyPair } from '@/api/signature/signature.api';

interface KeyPairCardProps {
    keyPair: KeyPairResponse | null;
    onRefresh: () => void;
}

// ─── Algorithm picker ─────────────────────────────────────────────────────────

function AlgorithmPicker({ value, onChange }: { value: KeyAlgorithm; onChange: (v: KeyAlgorithm) => void }) {
    const options: { id: KeyAlgorithm; name: string; note: string }[] = [
        { id: 'RSA_2048',  name: 'RSA-2048',  note: 'Max compatibility — banks & government' },
        { id: 'ED25519',   name: 'Ed25519',   note: 'Faster & smaller — modern integrations' },
    ];
    return (
        <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Algorithm</p>
            <div style={{ display: 'flex', gap: 8 }}>
                {options.map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        style={{
                            flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-md)',
                            border: `1.5px solid ${value === opt.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            background: value === opt.id ? 'var(--color-primary-subtle)' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 150ms ease',
                        }}
                    >
                        <div style={{ fontSize: 13, fontWeight: 600, color: value === opt.id ? 'var(--color-primary)' : 'var(--color-text-primary)', marginBottom: 2 }}>{opt.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{opt.note}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Danger confirm box ───────────────────────────────────────────────────────

function RotateConfirm({ algorithm, onChange, onConfirm, onCancel, loading }: {
    algorithm: KeyAlgorithm;
    onChange: (v: KeyAlgorithm) => void;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div style={{
            marginTop: 16, padding: 16, borderRadius: 'var(--radius-md)',
            background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)',
        }}>
            <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 500, color: 'var(--color-error)', lineHeight: 1.5 }}>
                Rotating revokes your current certificate permanently. You will need to issue a new one before you can sign again.
            </p>
            <AlgorithmPicker value={algorithm} onChange={onChange} />
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={onCancel} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={onConfirm} disabled={loading} style={{
                    flex: 1, padding: '10px 0', borderRadius: 9999,
                    background: 'var(--color-error)', color: '#fff',
                    border: 'none', fontSize: 12, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                }}>
                    {loading ? 'Rotating…' : 'Confirm Rotate'}
                </button>
            </div>
        </div>
    );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function KeyPairCard({ keyPair, onRefresh }: KeyPairCardProps) {
    const [loading, setLoading]       = useState(false);
    const [algorithm, setAlgorithm]   = useState<KeyAlgorithm>('RSA_2048');
    const [showPem, setShowPem]       = useState(false);
    const [showRotate, setShowRotate] = useState(false);
    const [copied, setCopied]         = useState(false);
    const [error, setError]           = useState<string | null>(null);

    async function handleGenerate() {
        setLoading(true); setError(null);
        try { await generateKeyPair(algorithm); onRefresh(); }
        catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to generate key pair'); }
        finally { setLoading(false); }
    }

    async function handleRotate() {
        setLoading(true); setError(null);
        try { await rotateKeyPair(algorithm); setShowRotate(false); onRefresh(); }
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
                            Private key is encrypted server-side — never returned
                        </p>
                    </div>
                </div>
                {/* Step badge */}
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
                            <button onClick={copyFingerprint} style={{
                                padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                                background: copied ? 'var(--color-success-subtle)' : 'rgba(91,35,255,0.06)',
                                border: `1px solid ${copied ? 'var(--color-success-border)' : 'var(--color-border)'}`,
                                color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)',
                                cursor: 'pointer', transition: 'all 150ms ease',
                            }}>
                                {copied ? '✓ Copied' : 'Copy'}
                            </button>
                        </div>
                        <code style={{ display: 'block', fontSize: 10.5, fontFamily: 'monospace', color: 'var(--color-text-secondary)', lineHeight: 1.6, wordBreak: 'break-all', background: 'rgba(91,35,255,0.04)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                            {keyPair.fingerprint}
                        </code>
                    </div>

                    {/* PEM toggle */}
                    <div style={{ marginTop: 14 }}>
                        <button onClick={() => setShowPem(v => !v)} style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            fontSize: 12, color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            <span style={{ fontSize: 10, transition: 'transform 150ms', transform: showPem ? 'rotate(90deg)' : 'none' }}>▶</span>
                            {showPem ? 'Hide public key' : 'Show public key (PEM)'}
                        </button>
                        {showPem && (
                            <div style={{ position: 'relative', marginTop: 10 }}>
                                <pre style={{
                                    margin: 0, padding: '12px 14px', borderRadius: 'var(--radius-md)',
                                    background: 'rgba(91,35,255,0.03)', border: '1px solid var(--color-border)',
                                    fontSize: 10, color: 'var(--color-text-secondary)',
                                    overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                                    maxHeight: 160, overflowY: 'auto', fontFamily: 'monospace', lineHeight: 1.7,
                                }}>
                                    {keyPair.publicKey}
                                </pre>
                                <button onClick={() => navigator.clipboard.writeText(keyPair.publicKey)} style={{
                                    position: 'absolute', top: 8, right: 8,
                                    padding: '2px 8px', borderRadius: 6, fontSize: 10, cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.9)', border: '1px solid var(--color-border)',
                                    color: 'var(--color-text-secondary)',
                                }}>Copy</button>
                            </div>
                        )}
                    </div>

                    {/* Rotate */}
                    {!showRotate ? (
                        <button onClick={() => setShowRotate(true)} style={{
                            marginTop: 20, width: '100%', padding: '9px 0', borderRadius: 9999,
                            background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)',
                            fontSize: 12, fontWeight: 500, color: 'var(--color-error)', cursor: 'pointer',
                        }}>
                            Rotate Key Pair
                        </button>
                    ) : (
                        <RotateConfirm
                            algorithm={algorithm}
                            onChange={setAlgorithm}
                            onConfirm={handleRotate}
                            onCancel={() => setShowRotate(false)}
                            loading={loading}
                        />
                    )}
                </>
            ) : (
                <>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
                        Generate an RSA or Ed25519 key pair to begin. Your private key is encrypted with a server-side master secret and is never accessible after generation.
                    </p>
                    <AlgorithmPicker value={algorithm} onChange={setAlgorithm} />
                    <button onClick={handleGenerate} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                        {loading ? 'Generating Key Pair…' : 'Generate Key Pair'}
                    </button>
                </>
            )}
        </div>
    );
}

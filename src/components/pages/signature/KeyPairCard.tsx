'use client';

/**
 * Step 1 card — RSA-2048 cryptographic key pair management.
 * Algorithm is fixed to RSA-2048 for maximum compatibility with banks and
 * government systems. The private key is encrypted server-side and never returned.
 */

import { useState } from 'react';
import type { KeyPairResponse } from '@/api/signature/signature.api';
import { generateKeyPair, rotateKeyPair } from '@/api/signature/signature.api';

/** RSA-2048 is the fixed algorithm — not user-selectable. */
const KEY_ALGORITHM = 'RSA_2048' as const;

interface KeyPairCardProps {
    keyPair: KeyPairResponse | null;
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
        <div style={{ marginTop: 16 }}>
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

// ─── Rotate confirm ───────────────────────────────────────────────────────────

/**
 * Danger confirmation panel shown before rotating the key pair.
 * Rotation permanently revokes the current certificate.
 */
function RotateConfirm({ onConfirm, onCancel, loading }: {
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
            <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 500, color: 'var(--color-error)', lineHeight: 1.55 }}>
                Rotating permanently revokes your current certificate. You will need to issue a new one before signing again.
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
                        transition: 'opacity 150ms ease',
                    }}
                >
                    {loading ? 'Rotating…' : 'Yes, Rotate Key Pair'}
                </button>
            </div>
        </div>
    );
}

// ─── Key detail row ───────────────────────────────────────────────────────────

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: '1px solid rgba(91,35,255,0.07)',
        }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
            <span style={{
                fontSize: 12.5, fontWeight: 600, color: 'var(--color-text-primary)',
                fontFamily: mono ? 'monospace' : undefined,
            }}>{value}</span>
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
        <div className="glass-strong" style={{ borderRadius: 'var(--radius-xl)', padding: 28 }}>

            {/* ── Header ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                        background: keyPair
                            ? 'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(5,150,105,0.06))'
                            : 'linear-gradient(135deg, var(--color-primary-subtle), rgba(91,35,255,0.04))',
                        border: `1.5px solid ${keyPair ? 'var(--color-success-border)' : 'var(--color-border-primary)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: keyPair
                            ? '0 4px 14px rgba(5,150,105,0.12)'
                            : '0 4px 14px rgba(91,35,255,0.08)',
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                            stroke={keyPair ? 'var(--color-success)' : 'var(--color-primary)'}
                            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                            Cryptographic Key Pair
                        </h3>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                            RSA-2048 · Private key encrypted server-side, never returned
                        </p>
                    </div>
                </div>
                <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
                    color: keyPair ? 'var(--color-success)' : 'var(--color-primary)',
                    background: keyPair ? 'var(--color-success-subtle)' : 'var(--color-primary-subtle)',
                    border: `1px solid ${keyPair ? 'var(--color-success-border)' : 'var(--color-border-primary)'}`,
                    borderRadius: 20, padding: '3px 10px', flexShrink: 0,
                    textTransform: 'uppercase' as const,
                }}>
                    {keyPair ? 'Active' : 'Step 1'}
                </span>
            </div>

            {/* ── Error ──────────────────────────────────────────── */}
            {error && (
                <div style={{ marginBottom: 18, padding: '11px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)', fontSize: 13, color: 'var(--color-error)', lineHeight: 1.5 }}>
                    {error}
                </div>
            )}

            {keyPair ? (
                <>
                    {/* ── Details ──────────────────────────────────── */}
                    <DetailRow
                        label="Algorithm"
                        value={keyPair.algorithm.replace('_', '-')}
                    />
                    <DetailRow
                        label="Created"
                        value={new Date(keyPair.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    />

                    {/* ── Fingerprint ──────────────────────────────── */}
                    <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(91,35,255,0.07)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>Fingerprint (SHA-256)</span>
                            <button
                                onClick={copyFingerprint}
                                style={{
                                    padding: '2px 10px', borderRadius: 20, fontSize: 10.5, fontWeight: 600,
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
                            color: 'var(--color-text-secondary)', lineHeight: 1.7,
                            wordBreak: 'break-all',
                            background: 'rgba(91,35,255,0.03)', padding: '9px 12px',
                            borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
                        }}>
                            {keyPair.fingerprint}
                        </code>
                    </div>

                    {/* ── Public key PEM ───────────────────────────── */}
                    <PemBlock label="Public Key (PEM)" pem={keyPair.publicKey} />

                    {/* ── Rotate ───────────────────────────────────── */}
                    {!showRotate ? (
                        <button
                            onClick={() => setShowRotate(true)}
                            style={{
                                marginTop: 22, width: '100%', padding: '10px 0', borderRadius: 9999,
                                background: 'var(--color-error-subtle)',
                                border: '1px solid var(--color-error-border)',
                                fontSize: 12, fontWeight: 500, color: 'var(--color-error)',
                                cursor: 'pointer', transition: 'background 150ms ease',
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
                /* ── Empty state ─────────────────────────────────── */
                <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                        background: 'var(--color-primary-subtle)',
                        border: '1.5px dashed var(--color-border-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 6, lineHeight: 1.6 }}>
                        No key pair yet
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.6, maxWidth: 340, margin: '0 auto 24px' }}>
                        Generate your RSA-2048 key pair to begin. Your private key is encrypted server-side and is never accessible after generation.
                    </p>
                    <button onClick={handleGenerate} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                        {loading ? 'Generating…' : 'Generate Key Pair'}
                    </button>
                </div>
            )}
        </div>
    );
}

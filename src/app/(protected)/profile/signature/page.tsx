'use client';

// Digital Signature page — orchestrates key pair, certificate, and image state.
// Loads all three in parallel; passes data down to each card component.

import { useCallback, useEffect, useState } from 'react';
import { KeyPairCard } from '@/components/pages/signature';
import { CertificateCard } from '@/components/pages/signature';
import { SignatureImageCard } from '@/components/pages/signature';
import type {
    KeyPairResponse,
    CertificateResponse,
    SignatureImageResponse,
} from '@/api/signature/signature.api';
import {
    getPublicKey,
    getCurrentCertificate,
    getSignatureImage,
} from '@/api/signature/signature.api';

// ─── Setup stepper ────────────────────────────────────────────────────────────

function SetupStepper({ hasKey, hasCert }: { hasKey: boolean; hasCert: boolean }) {
    const steps = [
        { label: 'Generate Key Pair', done: hasKey,   active: !hasKey },
        { label: 'Issue Certificate', done: hasCert,  active: hasKey && !hasCert },
        { label: 'Ready to Sign',     done: hasCert,  active: false },
    ];

    return (
        <div
            className="glass"
            style={{ borderRadius: 'var(--radius-lg)', padding: '14px 20px', display: 'flex', alignItems: 'center', marginBottom: 28 }}
        >
            {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700,
                            background: step.done ? 'var(--color-success)' : step.active ? 'var(--color-primary)' : 'rgba(91,35,255,0.08)',
                            color: step.done || step.active ? '#fff' : 'var(--color-text-muted)',
                            boxShadow: step.active ? '0 0 0 4px rgba(91,35,255,0.12)' : 'none',
                            transition: 'all 300ms ease',
                        }}>
                            {step.done ? '✓' : i + 1}
                        </div>
                        <span style={{
                            fontSize: 12, fontWeight: step.active ? 600 : 400,
                            color: step.done ? 'var(--color-success)' : step.active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        }}>
                            {step.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{
                            flex: 1, height: 2, margin: '0 10px', borderRadius: 1,
                            background: step.done ? 'var(--color-success)' : 'rgba(91,35,255,0.12)',
                            transition: 'background 400ms ease',
                        }} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignaturePage() {
    const [keyPair, setKeyPair]           = useState<KeyPairResponse | null>(null);
    const [certificate, setCertificate]   = useState<CertificateResponse | null>(null);
    const [image, setImage]               = useState<SignatureImageResponse | null>(null);
    const [loading, setLoading]           = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        const [kp, cert, img] = await Promise.allSettled([
            getPublicKey(),
            getCurrentCertificate(),
            getSignatureImage(),
        ]);
        setKeyPair(kp.status === 'fulfilled' ? kp.value : null);
        setCertificate(cert.status === 'fulfilled' ? cert.value : null);
        setImage(img.status === 'fulfilled' ? img.value : null);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 420 }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 36, height: 36,
                        border: '3px solid rgba(91,35,255,0.12)',
                        borderTopColor: 'var(--color-primary)',
                        borderRadius: '50%',
                        animation: 'sig-spin 0.8s linear infinite',
                        margin: '0 auto 14px',
                    }} />
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>Loading signature data…</p>
                </div>
                <style>{`@keyframes sig-spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const hasCert = !!certificate && !certificate.isRevoked;

    return (
        <div style={{ maxWidth: 740, margin: '0 auto', padding: '40px 24px 64px' }} className="animate-fade-up">

            {/* ── Page header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
                <div style={{
                    width: 54, height: 54, borderRadius: 16, flexShrink: 0,
                    background: 'var(--color-primary-subtle)',
                    border: '1.5px solid var(--color-border-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26,
                    boxShadow: '0 4px 16px rgba(91,35,255,0.10)',
                }}>
                    📜
                </div>
                <div>
                    <h1 style={{ margin: '0 0 5px', fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        Digital Signature
                    </h1>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, maxWidth: 520 }}>
                        Your cryptographic identity. Generate a key pair, issue an X.509 certificate, and sign documents with legal verifiability.
                    </p>
                </div>
            </div>

            {/* ── Stepper ── */}
            <SetupStepper hasKey={!!keyPair} hasCert={hasCert} />

            {/* ── Cards ── */}
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="animate-fade-up"><KeyPairCard keyPair={keyPair} onRefresh={load} /></div>
                <div className="animate-fade-up"><CertificateCard certificate={certificate} hasKeyPair={!!keyPair} onRefresh={load} /></div>
                <div className="animate-fade-up"><SignatureImageCard image={image} onRefresh={load} /></div>
            </div>
        </div>
    );
}

'use client';

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

export default function SignaturePage() {
    const [keyPair, setKeyPair] = useState<KeyPairResponse | null>(null);
    const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
    const [image, setImage] = useState<SignatureImageResponse | null>(null);
    const [loading, setLoading] = useState(true);

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
            <div
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: 320, color: 'var(--text-muted)', fontSize: 14,
                }}
            >
                Loading signature data…
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

            {/* Page header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Digital Signature
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Manage your cryptographic key pair, X.509 certificate, and visual signature image.
                    Your certificate is what makes your signatures legally verifiable by anyone.
                </p>
            </div>

            {/* Setup progress indicator */}
            <SetupProgress hasKeyPair={!!keyPair} hasCertificate={!!certificate && !certificate.isRevoked} />

            {/* Cards — stacked vertically with clear hierarchy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 28 }}>
                <KeyPairCard
                    keyPair={keyPair}
                    onRefresh={load}
                />
                <CertificateCard
                    certificate={certificate}
                    hasKeyPair={!!keyPair}
                    onRefresh={load}
                />
                <SignatureImageCard
                    image={image}
                    onRefresh={load}
                />
            </div>
        </div>
    );
}

function SetupProgress({
    hasKeyPair,
    hasCertificate,
}: {
    hasKeyPair: boolean;
    hasCertificate: boolean;
}) {
    const steps = [
        {
            n: 1,
            label: 'Generate Key Pair',
            done: hasKeyPair,
            active: !hasKeyPair,
        },
        {
            n: 2,
            label: 'Issue Certificate',
            done: hasCertificate,
            active: hasKeyPair && !hasCertificate,
        },
        {
            n: 3,
            label: 'Ready to Sign',
            done: hasCertificate,
            active: false,
        },
    ];

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--glass-panel)',
                border: '1px solid var(--glass-panel-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '16px 24px',
                gap: 0,
            }}
        >
            {steps.map((step, i) => (
                <div key={step.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <div
                            style={{
                                width: 28, height: 28,
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700,
                                background: step.done
                                    ? 'var(--success)'
                                    : step.active
                                        ? 'var(--primary)'
                                        : 'var(--glass-interactive)',
                                color: step.done || step.active ? '#fff' : 'var(--text-muted)',
                                border: step.active ? '2px solid var(--primary-border)' : '1px solid transparent',
                                boxShadow: step.active ? '0 0 12px var(--primary-glow)' : 'none',
                                transition: 'all 300ms ease',
                            }}
                        >
                            {step.done ? '✓' : step.n}
                        </div>
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: step.active ? 600 : 400,
                                color: step.done
                                    ? 'var(--success-text)'
                                    : step.active
                                        ? 'var(--text-primary)'
                                        : 'var(--text-muted)',
                            }}
                        >
                            {step.label}
                        </span>
                    </div>

                    {i < steps.length - 1 && (
                        <div
                            style={{
                                flex: 1,
                                height: 1,
                                margin: '0 12px',
                                background: step.done
                                    ? 'var(--success)'
                                    : 'var(--glass-card-border)',
                                transition: 'background 300ms ease',
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
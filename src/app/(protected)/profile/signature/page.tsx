'use client';

/**
 * Digital Signature page — orchestrates key pair, certificate, request, and image state.
 * Loads them in parallel and passes data to the individual card components.
 */

import { useCallback, useEffect, useState } from 'react';
import { KeyPairCard } from '@/components/pages/signature';
import { CertificateCard } from '@/components/pages/signature';
import { SignatureImageCard } from '@/components/pages/signature';
import type {
    KeyPairResponse,
    CertificateResponse,
    CertificateRequestResponse,
    CertificateRequestStatus,
    SignatureImageResponse,
} from '@/api/signature/signature.api';
import {
    getPublicKey,
    getCurrentCertificate,
    getCurrentCertificateRequest,
    getSignatureImage,
} from '@/api/signature/signature.api';

async function fetchSignatureState() {
    const [keyPair, certificate, certificateRequest, image] = await Promise.allSettled([
        getPublicKey(),
        getCurrentCertificate(),
        getCurrentCertificateRequest(),
        getSignatureImage(),
    ]);

    return {
        keyPair: keyPair.status === 'fulfilled' ? keyPair.value : null,
        certificate: certificate.status === 'fulfilled' ? certificate.value : null,
        certificateRequest: certificateRequest.status === 'fulfilled' ? certificateRequest.value : null,
        image: image.status === 'fulfilled' ? image.value : null,
    };
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 40, height: 40,
                    border: '3px solid rgba(91,35,255,0.12)',
                    borderTopColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    animation: 'sig-spin 0.75s linear infinite',
                    margin: '0 auto 16px',
                }} />
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>
                    Loading your signature data…
                </p>
            </div>
            <style>{`@keyframes sig-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ─── Setup stepper ────────────────────────────────────────────────────────────

function SetupStepper({
    hasKey,
    hasCert,
    requestStatus,
}: {
    hasKey: boolean;
    hasCert: boolean;
    requestStatus: CertificateRequestStatus | null;
}) {
    const steps = [
        { label: 'Generate Key Pair', done: hasKey,  active: !hasKey },
        {
            label: getStepTwoLabel(requestStatus),
            done: hasCert,
            active: hasKey && !hasCert,
        },
        { label: 'Ready to Sign',     done: hasCert, active: false },
    ];

    return (
        <div style={{
            borderRadius: 'var(--radius-lg)',
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            marginBottom: 32,
            background: 'rgba(255,255,255,0.62)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.92)',
            boxShadow: '0 4px 24px rgba(91,35,255,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        }}>
            {steps.map((step, i) => (
                <div
                    key={i}
                    style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 11, fontWeight: 700,
                            background: step.done
                                ? 'var(--color-success)'
                                : step.active
                                  ? 'var(--color-primary)'
                                  : 'rgba(91,35,255,0.08)',
                            color: step.done || step.active ? '#fff' : 'var(--color-text-muted)',
                            boxShadow: step.active ? '0 0 0 4px rgba(91,35,255,0.12)' : 'none',
                            transition: 'all 300ms ease',
                            flexShrink: 0,
                        }}>
                            {step.done ? '✓' : i + 1}
                        </div>
                        <span style={{
                            fontSize: 12, fontWeight: step.done || step.active ? 600 : 400,
                            color: step.done
                                ? 'var(--color-success)'
                                : step.active
                                  ? 'var(--color-primary)'
                                  : 'var(--color-text-muted)',
                            whiteSpace: 'nowrap',
                        }}>
                            {step.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{
                            flex: 1, height: 2, margin: '0 12px', borderRadius: 1,
                            background: step.done ? 'var(--color-success)' : 'rgba(91,35,255,0.10)',
                            transition: 'background 400ms ease',
                        }} />
                    )}
                </div>
            ))}
        </div>
    );
}

function getStepTwoLabel(requestStatus: CertificateRequestStatus | null) {
    if (requestStatus === 'PENDING') return 'Await Approval';
    if (requestStatus === 'APPROVED') return 'Activate Certificate';
    if (requestStatus === 'REJECTED') return 'Review Rejection';
    if (requestStatus === 'CANCELLED') return 'Request Again';
    return 'Request Certificate';
}

// ─── Ready banner ─────────────────────────────────────────────────────────────

function ReadyBanner() {
    return (
        <div style={{
            marginBottom: 28, padding: '14px 18px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-success-subtle)',
            border: '1px solid var(--color-success-border)',
            display: 'flex', alignItems: 'center', gap: 12,
        }}>
            <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: 'var(--color-success)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700,
                boxShadow: '0 0 0 4px rgba(5,150,105,0.14)',
            }}>✓</div>
            <div>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: 'var(--color-success)' }}>
                    Cryptographic identity ready
                </p>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-success)', opacity: 0.8, lineHeight: 1.5 }}>
                    Your key pair and certificate are active. You can sign documents on Gracon.
                </p>
            </div>
        </div>
    );
}

function RequestBanner({ status }: { status: CertificateRequestStatus }) {
    const content = getRequestBannerContent(status);

    return (
        <div style={{
            marginBottom: 28, padding: '14px 18px',
            borderRadius: 'var(--radius-lg)',
            background: content.background,
            border: `1px solid ${content.border}`,
            display: 'flex', alignItems: 'center', gap: 12,
        }}>
            <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: content.iconBackground, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700,
                boxShadow: `0 0 0 4px ${content.ring}`,
            }}>{content.icon}</div>
            <div>
                <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: content.titleColor }}>
                    {content.title}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: content.bodyColor, opacity: 0.88, lineHeight: 1.5 }}>
                    {content.body}
                </p>
            </div>
        </div>
    );
}

function getRequestBannerContent(status: CertificateRequestStatus) {
    if (status === 'APPROVED') {
        return {
            title: 'Request approved',
            body: 'Your certificate request has been approved. Refresh the certificate card if the active certificate has not appeared yet.',
            titleColor: 'var(--color-primary)',
            bodyColor: 'var(--color-primary)',
            background: 'var(--color-primary-subtle)',
            border: 'var(--color-border-primary)',
            iconBackground: 'var(--color-primary)',
            ring: 'rgba(91,35,255,0.14)',
            icon: '✓',
        };
    }

    if (status === 'REJECTED') {
        return {
            title: 'Request rejected',
            body: 'Review the admin note in the certificate card, fix the issue, then submit a fresh request.',
            titleColor: 'var(--color-error)',
            bodyColor: 'var(--color-error)',
            background: 'var(--color-error-subtle)',
            border: 'var(--color-error-border)',
            iconBackground: 'var(--color-error)',
            ring: 'rgba(239,68,68,0.14)',
            icon: '×',
        };
    }

    if (status === 'CANCELLED') {
        return {
            title: 'Request no longer active',
            body: 'Your previous request was cancelled. Generate or keep your current key pair, then submit a fresh certificate request.',
            titleColor: 'var(--color-text-secondary)',
            bodyColor: 'var(--color-text-secondary)',
            background: 'rgba(148,163,184,0.10)',
            border: 'rgba(148,163,184,0.22)',
            iconBackground: 'var(--color-text-muted)',
            ring: 'rgba(148,163,184,0.14)',
            icon: '•',
        };
    }

    return {
        title: 'Certificate approval pending',
        body: 'Your request is waiting for admin review. You will be able to sign only after approval.',
        titleColor: 'var(--color-warning)',
        bodyColor: 'var(--color-warning)',
        background: 'rgba(245, 158, 11, 0.08)',
        border: 'rgba(245, 158, 11, 0.24)',
        iconBackground: 'var(--color-warning)',
        ring: 'rgba(245,158,11,0.14)',
        icon: '!',
    };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignaturePage() {
    const [keyPair, setKeyPair]         = useState<KeyPairResponse | null>(null);
    const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
    const [certificateRequest, setCertificateRequest] = useState<CertificateRequestResponse | null>(null);
    const [image, setImage]             = useState<SignatureImageResponse | null>(null);
    const [loading, setLoading]         = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        const nextState = await fetchSignatureState();
        setKeyPair(nextState.keyPair);
        setCertificate(nextState.certificate);
        setCertificateRequest(nextState.certificateRequest);
        setImage(nextState.image);
        setLoading(false);
    }, []);

    useEffect(() => {
        let active = true;

        void (async () => {
            const nextState = await fetchSignatureState();
            if (!active) return;
            setKeyPair(nextState.keyPair);
            setCertificate(nextState.certificate);
            setCertificateRequest(nextState.certificateRequest);
            setImage(nextState.image);
            setLoading(false);
        })();

        return () => {
            active = false;
        };
    }, []);

    if (loading) return <Spinner />;

    const hasCert = !!certificate && !certificate.isRevoked && !certificate.isExpired;
    const requestStatus = certificateRequest?.status ?? null;
    const isReady = !!keyPair && hasCert;

    return (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 72px' }} className="animate-fade-up">

            {/* ── Page header ────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 32 }}>
                <div style={{
                    width: 56, height: 56, borderRadius: 18, flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--color-primary-subtle) 0%, rgba(91,35,255,0.14) 100%)',
                    border: '1.5px solid var(--color-border-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 6px 20px rgba(91,35,255,0.13)',
                }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 12 11 14 15 10" />
                    </svg>
                </div>
                <div>
                    <h1 style={{
                        margin: '0 0 6px', fontSize: 28, fontWeight: 800,
                        color: 'var(--color-text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15,
                    }}>
                        Digital Signature
                    </h1>
                    <p style={{
                        margin: 0, fontSize: 13, color: 'var(--color-text-secondary)',
                        lineHeight: 1.65, maxWidth: 500,
                    }}>
                        Your cryptographic identity. Generate an RSA-2048 key pair, request an X.509 certificate,
                        wait for admin approval, and then sign documents with legal verifiability.
                    </p>
                </div>
            </div>

            {/* ── Setup stepper ──────────────────────────────────── */}
            <SetupStepper hasKey={!!keyPair} hasCert={hasCert} requestStatus={requestStatus} />

            {/* ── Ready banner ───────────────────────────────────── */}
            {isReady && <ReadyBanner />}
            {!isReady && requestStatus && <RequestBanner status={requestStatus} />}

            {/* ── Cards ──────────────────────────────────────────── */}
            <div className="stagger" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="animate-fade-up"><KeyPairCard keyPair={keyPair} onRefresh={load} /></div>
                <div className="animate-fade-up">
                    <CertificateCard
                        certificate={certificate}
                        certificateRequest={certificateRequest}
                        hasKeyPair={!!keyPair}
                        onRefresh={load}
                    />
                </div>
                <div className="animate-fade-up"><SignatureImageCard image={image} onRefresh={load} /></div>
            </div>
        </div>
    );
}

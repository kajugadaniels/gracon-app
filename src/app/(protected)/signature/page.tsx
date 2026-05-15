'use client';

/**
 * Digital Signature page — orchestrates key pair, certificate, request, and image state.
 * Loads them in parallel and passes data to the individual card components.
 */

import { useCallback, useEffect, useState } from 'react';
import { KeyPairCard } from '@/components/pages/signature';
import { CertificateCard } from '@/components/pages/signature';
import { SignatureImageCard } from '@/components/pages/signature';
import { AppLoadingState } from '@/components/ui/AppLoadingState';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import styles from './signature-page.module.css';
import type {
    KeyPairResponse,
    CertificateResponse,
    CertificateRequestResponse,
    CertificateRequestStatus,
    CertificateStatusResponse,
    SignatureImageResponse,
} from '@/api/signature/signature.api';
import {
    getPublicKey,
    getCurrentCertificate,
    getCurrentCertificateRequest,
    getCurrentCertificateStatus,
    getSignatureImage,
} from '@/api/signature/signature.api';

async function fetchSignatureState() {
    const [keyPair, certificate, certificateRequest, certificateStatus, image] = await Promise.allSettled([
        getPublicKey(),
        getCurrentCertificate(),
        getCurrentCertificateRequest(),
        getCurrentCertificateStatus(),
        getSignatureImage(),
    ]);

    return {
        keyPair: keyPair.status === 'fulfilled' ? keyPair.value : null,
        certificate: certificate.status === 'fulfilled' ? certificate.value : null,
        certificateRequest: certificateRequest.status === 'fulfilled' ? certificateRequest.value : null,
        certificateStatus: certificateStatus.status === 'fulfilled' ? certificateStatus.value : null,
        image: image.status === 'fulfilled' ? image.value : null,
    };
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
        <div className={styles.stepper}>
            {steps.map((step, i) => (
                <div
                    key={i}
                    className={`${styles.step} ${i < steps.length - 1 ? styles.stepGrow : ''}`}
                >
                    <div className={styles.stepContent}>
                        <div
                            className={[
                                styles.stepMarker,
                                step.done ? styles.stepMarkerDone : '',
                                step.active ? styles.stepMarkerActive : '',
                            ].filter(Boolean).join(' ')}
                        >
                            {step.done ? '✓' : i + 1}
                        </div>
                        <span
                            className={[
                                styles.stepLabel,
                                step.done ? styles.stepLabelDone : '',
                                step.active ? styles.stepLabelActive : '',
                            ].filter(Boolean).join(' ')}
                        >
                            {step.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div
                            className={`${styles.stepLine} ${step.done ? styles.stepLineDone : ''}`}
                        />
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
        <div className={`${styles.banner} ${styles.bannerSuccess}`}>
            <div className={styles.bannerIcon}>✓</div>
            <div>
                <p className={styles.bannerTitle}>
                    Cryptographic identity ready
                </p>
                <p className={styles.bannerBody}>
                    Your key pair and certificate are active. You can sign documents on Gracon.
                </p>
            </div>
        </div>
    );
}

function RequestBanner({ status }: { status: CertificateRequestStatus }) {
    const content = getRequestBannerContent(status);

    return (
        <div className={`${styles.banner} ${content.className}`}>
            <div className={styles.bannerIcon}>{content.icon}</div>
            <div>
                <p className={styles.bannerTitle}>
                    {content.title}
                </p>
                <p className={styles.bannerBody}>
                    {content.body}
                </p>
            </div>
        </div>
    );
}

function CertificateAccessBanner({
    status,
}: {
    status: CertificateStatusResponse;
}) {
    const isBanned = status.accessPolicy.isBanned;
    const revocation = status.latestRevocation;

    if (!isBanned && !revocation) {
        return null;
    }

    const title = isBanned
        ? 'Certificate access restricted'
        : 'Certificate revoked';
    const body = isBanned
        ? 'You cannot request certificates or sign documents until this restriction is lifted.'
        : 'You must submit a fresh certificate request before signing again.';
    const reason = isBanned
        ? status.accessPolicy.banReason
        : revocation?.revokedReason;
    const date = isBanned
        ? status.accessPolicy.bannedAt
        : revocation?.revokedAt ?? null;

    return (
        <div className={`${styles.banner} ${styles.bannerError} ${styles.accessBanner}`}>
            <div className={styles.bannerIcon}>!</div>
            <div className={styles.accessContent}>
                <p className={styles.accessTitle}>{title}</p>
                <p className={styles.accessBody}>{body}</p>
                {reason && (
                    <div className={styles.accessReason}>
                        <span className={styles.accessReasonLabel}>Admin reason</span>
                        <p className={styles.accessReasonText}>{reason}</p>
                    </div>
                )}
                {date && (
                    <p className={styles.accessDate}>
                        Updated {formatLongDate(date)}
                    </p>
                )}
            </div>
        </div>
    );
}

function getRequestBannerContent(status: CertificateRequestStatus) {
    if (status === 'APPROVED') {
        return {
            title: 'Request approved',
            body: 'Your certificate request has been approved. Refresh the certificate card if the active certificate has not appeared yet.',
            className: styles.bannerPrimary,
            icon: '✓',
        };
    }

    if (status === 'REJECTED') {
        return {
            title: 'Request rejected',
            body: 'Review the admin note in the certificate card, fix the issue, then submit a fresh request.',
            className: styles.bannerError,
            icon: '×',
        };
    }

    if (status === 'CANCELLED') {
        return {
            title: 'Request no longer active',
            body: 'Your previous request was cancelled. Generate or keep your current key pair, then submit a fresh certificate request.',
            className: styles.bannerMuted,
            icon: '•',
        };
    }

    return {
        title: 'Certificate approval pending',
        body: 'Your request is waiting for admin review. You will be able to sign only after approval.',
        className: styles.bannerWarning,
        icon: '!',
    };
}

function formatLongDate(value: string | null) {
    if (!value) return 'unknown time';

    return new Date(value).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function InfoTip({ text }: { text: string }) {
    return (
        <span className={styles.infoTip} tabIndex={0} data-tooltip={text}>
            i
        </span>
    );
}

function StatusSummary({
    hasKey,
    hasCert,
    hasImage,
    requestStatus,
}: {
    hasKey: boolean;
    hasCert: boolean;
    hasImage: boolean;
    requestStatus: CertificateRequestStatus | null;
}) {
    const items = [
        {
            label: 'Key pair',
            value: hasKey ? 'Generated' : 'Not generated',
            ready: hasKey,
            help: 'Your private key stays with your account and is used to create cryptographic signatures.',
        },
        {
            label: 'Certificate',
            value: hasCert ? 'Active' : requestStatus ? getStepTwoLabel(requestStatus) : 'Not requested',
            ready: hasCert,
            help: 'The certificate links your verified identity to your signing key after approval.',
        },
        {
            label: 'Signature image',
            value: hasImage ? 'Uploaded' : 'Optional',
            ready: hasImage,
            help: 'This image is only visual. The certificate is what makes document signing verifiable.',
        },
    ];

    return (
        <div className={styles.statusGrid} aria-label="Digital signature setup status">
            {items.map((item) => (
                <div key={item.label} className={styles.statusCard}>
                    <div className={styles.statusLabel}>
                        {item.label}
                        <InfoTip text={item.help} />
                    </div>
                    <div className={item.ready ? styles.statusReady : styles.statusPending}>
                        {item.value}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignaturePage() {
    usePageTitle('Digital Signature');

    const [keyPair, setKeyPair]         = useState<KeyPairResponse | null>(null);
    const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
    const [certificateRequest, setCertificateRequest] = useState<CertificateRequestResponse | null>(null);
    const [certificateStatus, setCertificateStatus] = useState<CertificateStatusResponse | null>(null);
    const [image, setImage]             = useState<SignatureImageResponse | null>(null);
    const [loading, setLoading]         = useState(true);

    const applyState = useCallback((nextState: Awaited<ReturnType<typeof fetchSignatureState>>) => {
        setKeyPair(nextState.keyPair);
        setCertificate(nextState.certificate);
        setCertificateRequest(nextState.certificateRequest);
        setCertificateStatus(nextState.certificateStatus);
        setImage(nextState.image);
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        const nextState = await fetchSignatureState();
        applyState(nextState);
        setLoading(false);
    }, [applyState]);

    const refreshInBackground = useCallback(async () => {
        const nextState = await fetchSignatureState();
        applyState(nextState);
    }, [applyState]);

    useEffect(() => {
        let active = true;

        void (async () => {
            const nextState = await fetchSignatureState();
            if (!active) return;
            applyState(nextState);
            setLoading(false);
        })();

        return () => {
            active = false;
        };
    }, [applyState]);

    const hasCert = !!certificate && !certificate.isRevoked && !certificate.isExpired;
    const requestStatus = certificateRequest?.status ?? null;
    const isReady = !!keyPair && hasCert;
    const hasImage = !!image?.url;

    useEffect(() => {
        if (isReady || !requestStatus) {
            return;
        }

        if (requestStatus !== 'PENDING' && requestStatus !== 'APPROVED') {
            return;
        }

        const interval = window.setInterval(() => {
            void refreshInBackground();
        }, 30_000);

        return () => window.clearInterval(interval);
    }, [isReady, refreshInBackground, requestStatus]);

    if (loading) {
        return (
            <AppLoadingState
                variant="panel"
                minHeight="400px"
                message="Loading digital signature..."
                detail="Checking keys, certificate status, and signature image"
            />
        );
    }

    return (
        <div className={`${styles.page} animate-fade-up`}>

            {/* ── Page header ────────────────────────────────────── */}
            <section className={styles.hero}>
                <div className={styles.heroMain}>
                    <div className={styles.header}>
                        <div className={styles.headerIcon}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <polyline points="9 12 11 14 15 10" />
                            </svg>
                        </div>
                        <div>
                            <p className={styles.eyebrow}>Signing identity</p>
                            <h1 className={styles.title}>
                                Digital Signature
                            </h1>
                            <p className={styles.subtitle}>
                                Set up the verified identity used when you sign Gracon 360 documents.
                                Your key pair, approved certificate, and optional handwritten image work together,
                                but each one has a different purpose.
                            </p>
                        </div>
                    </div>

                    <StatusSummary
                        hasKey={!!keyPair}
                        hasCert={hasCert}
                        hasImage={hasImage}
                        requestStatus={requestStatus}
                    />
                </div>

                <aside className={styles.explainPanel} aria-label="How digital signing works">
                    <p className={styles.panelTitle}>How this works</p>
                    <div className={styles.explainList}>
                        <div>
                            <strong>1. Create signing keys</strong>
                            <span>Generate the cryptographic key pair used for document signatures.</span>
                        </div>
                        <div>
                            <strong>2. Request approval</strong>
                            <span>An admin approves the certificate that links your key to your verified identity.</span>
                        </div>
                        <div>
                            <strong>3. Sign documents</strong>
                            <span>Approved certificates make signatures verifiable. The image is only for display.</span>
                        </div>
                    </div>
                    <p className={styles.panelNote}>
                        Need help? Hover the small info markers beside each status or section label.
                    </p>
                </aside>
            </section>

            <div className={styles.helperGrid}>
                <div className={styles.helperCard}>
                    <span className={styles.helperLabel}>
                        Certificate
                        <InfoTip text="A certificate proves that an approved Gracon identity owns the signing key." />
                    </span>
                    <p>Required before you can produce trusted digital signatures.</p>
                </div>
                <div className={styles.helperCard}>
                    <span className={styles.helperLabel}>
                        Signature image
                        <InfoTip text="The image appears on documents, but it does not replace the cryptographic signature." />
                    </span>
                    <p>Optional visual signature for printed or previewed documents.</p>
                </div>
            </div>

            {/* ── Setup stepper ──────────────────────────────────── */}
            <SetupStepper hasKey={!!keyPair} hasCert={hasCert} requestStatus={requestStatus} />

            {/* ── Ready banner ───────────────────────────────────── */}
            {certificateStatus && <CertificateAccessBanner status={certificateStatus} />}
            {isReady && <ReadyBanner />}
            {!isReady && requestStatus && <RequestBanner status={requestStatus} />}

            {/* ── Cards ──────────────────────────────────────────── */}
            <div className={`${styles.cards} stagger`}>
                <div className="animate-fade-up"><KeyPairCard keyPair={keyPair} onRefresh={load} /></div>
                <div className="animate-fade-up">
                    <CertificateCard
                        certificate={certificate}
                        certificateRequest={certificateRequest}
                        certificateStatus={certificateStatus}
                        hasKeyPair={!!keyPair}
                        onRefresh={load}
                    />
                </div>
                <div className="animate-fade-up"><SignatureImageCard image={image} onRefresh={load} /></div>
            </div>
        </div>
    );
}

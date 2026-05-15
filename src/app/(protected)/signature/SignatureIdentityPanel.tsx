import type { CertificateRequestStatus } from '@/api/signature/signature.api';
import { SignatureInfoTip } from './SignatureInfoTip';
import styles from './SignatureIdentityPanel.module.css';

interface SignatureIdentityPanelProps {
    hasKey: boolean;
    hasCert: boolean;
    hasImage: boolean;
    requestStatus: CertificateRequestStatus | null;
}

export function SignatureIdentityPanel({
    hasKey,
    hasCert,
    hasImage,
    requestStatus,
}: SignatureIdentityPanelProps) {
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
        <aside className={styles.panel} aria-label="Signing identity summary">
            <div className={styles.headerIcon}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                </svg>
            </div>

            <p className={styles.eyebrow}>Signing identity</p>
            <h1 className={styles.title}>Digital Signature</h1>
            <p className={styles.subtitle}>
                This page prepares the verified identity you use to sign Gracon 360 documents.
            </p>

            <div className={styles.statusList}>
                {items.map((item) => (
                    <div key={item.label} className={styles.statusCard}>
                        <div className={styles.statusLabel}>
                            {item.label}
                            <SignatureInfoTip text={item.help} />
                        </div>
                        <div className={item.ready ? styles.statusReady : styles.statusPending}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.plainNote}>
                <strong>Plain English</strong>
                <span>
                    The certificate is the real trusted signature. The handwritten image is only a visual mark.
                </span>
            </div>
        </aside>
    );
}

function getStepTwoLabel(requestStatus: CertificateRequestStatus | null) {
    if (requestStatus === 'PENDING') return 'Awaiting approval';
    if (requestStatus === 'APPROVED') return 'Approved';
    if (requestStatus === 'REJECTED') return 'Rejected';
    if (requestStatus === 'CANCELLED') return 'Request again';
    return 'Request certificate';
}

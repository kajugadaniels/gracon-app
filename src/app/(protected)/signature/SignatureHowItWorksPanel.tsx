import styles from './SignatureHowItWorksPanel.module.css';

export function SignatureHowItWorksPanel() {
    return (
        <aside className={styles.panel} aria-label="How digital signing works">
            <p className={styles.eyebrow}>How it works</p>
            <h2 className={styles.title}>From setup to trusted signature</h2>
            <p className={styles.summary}>
                You need three things before signing feels complete: a key pair, an approved certificate,
                and optionally a visible signature image for documents.
            </p>

            <div className={styles.steps}>
                <Step
                    number="1"
                    title="Create signing keys"
                    body="Generate the cryptographic key pair used to sign document hashes."
                />
                <Step
                    number="2"
                    title="Request approval"
                    body="An admin approves the certificate that links your verified identity to your signing key."
                />
                <Step
                    number="3"
                    title="Add visual signature"
                    body="Upload or draw a signature image if you want a handwritten mark shown on documents."
                />
                <Step
                    number="4"
                    title="Sign documents"
                    body="After approval, signatures become verifiable through the certificate and document hash."
                />
            </div>

            <div className={styles.securityNote}>
                <strong>Important</strong>
                <span>
                    Never confuse the image with the legal signature. Verification depends on the certificate,
                    key, and signed document content.
                </span>
            </div>
        </aside>
    );
}

function Step({
    number,
    title,
    body,
}: {
    number: string;
    title: string;
    body: string;
}) {
    return (
        <div className={styles.step}>
            <span className={styles.stepNumber}>{number}</span>
            <div>
                <strong>{title}</strong>
                <p>{body}</p>
            </div>
        </div>
    );
}

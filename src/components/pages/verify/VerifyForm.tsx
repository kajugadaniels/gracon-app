'use client';

import { useState } from 'react';
import { verifySignature } from '@/api/signature/signature.api';
import type { VerifyResponse } from '@/api/signature/signature.api';
import styles from './VerifyForm.module.css';

export function VerifyForm() {
    const [documentHash, setDocumentHash] = useState('');
    const [signatureBytes, setSignatureBytes] = useState('');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VerifyResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleVerify() {
        setError(null);
        setResult(null);

        const hash = documentHash.trim().toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(hash)) {
            setError('Document hash must be exactly 64 hex characters (SHA-256).');
            return;
        }
        if (!signatureBytes.trim()) {
            setError('Please paste the signature bytes.');
            return;
        }
        if (!userId.trim()) {
            setError('Please enter the signer\'s user ID.');
            return;
        }

        setLoading(true);
        try {
            const res = await verifySignature({
                documentHash: hash,
                signatureBytes: signatureBytes.trim(),
                userId: userId.trim(),
            });
            setResult(res);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Verification request failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    function reset() {
        setDocumentHash('');
        setSignatureBytes('');
        setUserId('');
        setResult(null);
        setError(null);
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.icon}>🔍</div>
                <h2 className={styles.title}>
                    Verify a Signature
                </h2>
                <p className={styles.description}>
                    Paste the signature bytes, document hash, and signer ID to confirm authenticity. No account required.
                </p>
            </div>

            {/* Fields */}
            {[
                {
                    id: 'hash',
                    label: 'Document Hash (SHA-256)',
                    value: documentHash,
                    onChange: setDocumentHash,
                    placeholder: 'e3b0c44298fc1c149afb4c8996fb924…',
                    mono: true,
                },
                {
                    id: 'sig',
                    label: 'Signature Bytes (base64)',
                    value: signatureBytes,
                    onChange: setSignatureBytes,
                    placeholder: 'MEUCIQDk3…',
                    mono: true,
                },
                {
                    id: 'uid',
                    label: 'Signer User ID',
                    value: userId,
                    onChange: setUserId,
                    placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                    mono: true,
                },
            ].map(({ id, label, value, onChange, placeholder, mono }) => (
                <div key={id} className={styles.field}>
                    <label
                        htmlFor={id}
                        className={styles.label}
                    >
                        {label}
                    </label>
                    <input
                        id={id}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`${styles.input} ${mono ? styles.mono : ''}`}
                    />
                </div>
            ))}

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            {/* Result */}
            {result && (
                <div
                    className={`${styles.result} ${result.valid ? styles.resultValid : styles.resultInvalid}`}
                >
                    <div className={`${styles.resultHeader} ${result.valid ? styles.resultHeaderSpaced : ''}`}>
                        <span className={styles.resultIcon}>{result.valid ? '✅' : '❌'}</span>
                        <div>
                            <p
                                className={`${styles.resultTitle} ${result.valid ? styles.validText : styles.invalidText}`}
                            >
                                {result.valid ? 'Signature is Valid' : 'Signature is Invalid'}
                            </p>
                            {!result.valid && result.reason && (
                                <p className={styles.reason}>
                                    {result.reason}
                                </p>
                            )}
                        </div>
                    </div>

                    {result.valid && result.signer && (
                        <div className={styles.signerDetails}>
                            {[
                                { label: 'Signed by', value: result.signer.subjectCN },
                                { label: 'Certificate', value: result.signer.certificateId.slice(0, 16) + '…' },
                                { label: 'Valid until', value: new Date(result.signer.notAfter).toLocaleDateString() },
                            ].map(({ label, value }) => (
                                <div
                                    key={label}
                                    className={styles.signerRow}
                                >
                                    <span className={styles.signerLabel}>{label}</span>
                                    <span className={styles.signerValue}>
                                        {value}
                                    </span>
                                </div>
                            ))}

                            <div className={styles.confirmation}>
                                <p className={styles.confirmationText}>
                                    This document has not been modified since it was signed. The document hash matches the signature exactly.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {result ? (
                <button
                    onClick={reset}
                    className={styles.secondaryButton}
                >
                    Verify Another Signature
                </button>
            ) : (
                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className={`btn-primary ${styles.submit}`}
                >
                    {loading ? (
                        <span className={styles.loadingLabel}>
                            <span className="btn-spinner" /> Verifying…
                        </span>
                    ) : 'Verify Signature'}
                </button>
            )}
        </div>
    );
}

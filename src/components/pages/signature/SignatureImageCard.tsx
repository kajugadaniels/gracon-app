'use client';

import { useRef, useState } from 'react';
import type { SignatureImageResponse } from '@/api/signature/signature.api';
import { uploadSignatureImage, deleteSignatureImage } from '@/api/signature/signature.api';

interface SignatureImageCardProps {
    image: SignatureImageResponse | null;
    onRefresh: () => void;
}

export function SignatureImageCard({ image, onRefresh }: SignatureImageCardProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/png', 'image/svg+xml'].includes(file.type)) {
            setError('Only PNG and SVG files are accepted.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('File must be smaller than 2 MB.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await uploadSignatureImage(file);
            onRefresh();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Upload failed';
            setError(msg);
        } finally {
            setLoading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    async function handleDelete() {
        setDeleting(true);
        setError(null);
        try {
            await deleteSignatureImage();
            onRefresh();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to remove image';
            setError(msg);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div
            style={{
                background: 'var(--glass-card)',
                backdropFilter: 'blur(var(--glass-card-blur))',
                border: '1px solid var(--glass-card-border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--glass-card-shadow)',
                padding: 28,
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div
                    style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'var(--primary-glass)', border: '1px solid var(--primary-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}
                >
                    ✍️
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                        Signature Image
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                        Optional — displayed on printed documents for human readability only
                    </p>
                </div>
            </div>

            {/* Info callout */}
            <div
                style={{
                    background: 'var(--primary-glass)', border: '1px solid var(--primary-border)',
                    borderRadius: 'var(--radius-md)', padding: '10px 14px',
                    fontSize: 12, color: 'var(--primary-text)', marginBottom: 20,
                    lineHeight: 1.5,
                }}
            >
                This image has no cryptographic value. Your legal signature is the mathematical certificate above — not this image.
            </div>

            {error && (
                <div
                    style={{
                        background: 'var(--error-glass)', border: '1px solid var(--error-border)',
                        borderRadius: 'var(--radius-md)', padding: '10px 14px',
                        fontSize: 13, color: 'var(--error-text)', marginBottom: 16,
                    }}
                >
                    {error}
                </div>
            )}

            {image ? (
                <div>
                    {/* Image preview */}
                    <div
                        style={{
                            background: 'rgba(0,0,0,0.25)',
                            border: '1px solid var(--glass-card-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 120,
                            marginBottom: 16,
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image.url}
                            alt="Your signature"
                            style={{
                                maxWidth: '100%', maxHeight: 100,
                                objectFit: 'contain', filter: 'invert(1)',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={() => inputRef.current?.click()}
                            disabled={loading}
                            style={{
                                flex: 1, background: 'var(--glass-interactive)',
                                border: '1px solid var(--glass-interactive-border)',
                                borderRadius: 'var(--radius-md)', padding: '9px 0',
                                fontSize: 13, color: 'var(--text-secondary)',
                                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                            }}
                        >
                            Replace
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{
                                flex: 1, background: 'var(--error-glass)',
                                border: '1px solid var(--error-border)',
                                borderRadius: 'var(--radius-md)', padding: '9px 0',
                                fontSize: 13, fontWeight: 500, color: 'var(--error-text)',
                                cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1,
                            }}
                        >
                            {deleting ? 'Removing…' : 'Remove'}
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    {/* Upload dropzone */}
                    <div
                        onClick={() => inputRef.current?.click()}
                        style={{
                            border: '2px dashed var(--glass-card-border)',
                            borderRadius: 'var(--radius-md)', padding: 32,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: 10,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'border-color 150ms ease',
                            opacity: loading ? 0.6 : 1,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary-border)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--glass-card-border)')}
                    >
                        <span style={{ fontSize: 32 }}>📤</span>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                            {loading ? 'Uploading…' : 'Upload signature image'}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                            PNG or SVG · Max 2 MB
                        </p>
                    </div>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/svg+xml"
                onChange={handleFile}
                style={{ display: 'none' }}
            />
        </div>
    );
}
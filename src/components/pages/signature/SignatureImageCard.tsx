'use client';

// Optional card — visual signature image (PNG/SVG ≤ 2MB).
// This image has no cryptographic value; it is for human readability on printed docs.

import { useRef, useState } from 'react';
import type { SignatureImageResponse } from '@/api/signature/signature.api';
import { uploadSignatureImage, deleteSignatureImage } from '@/api/signature/signature.api';
import { SignaturePad } from './SignaturePad';

interface SignatureImageCardProps {
    image: SignatureImageResponse | null;
    onRefresh: () => Promise<void> | void;
}

type EditorMode = 'draw' | 'upload';

/** Format bytes into a human-readable size string. */
function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SignatureImageCard({ image, onRefresh }: SignatureImageCardProps) {
    const inputRef               = useRef<HTMLInputElement>(null);
    const [loading, setLoading]  = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [error, setError]      = useState<string | null>(null);
    const [mode, setMode]        = useState<EditorMode>('draw');
    const [editing, setEditing]  = useState(false);

    function validateAndUpload(file: File) {
        if (!['image/png', 'image/svg+xml'].includes(file.type)) {
            setError('Only PNG and SVG files are accepted.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('File must be smaller than 2 MB.');
            return;
        }
        void doUpload(file);
    }

    async function doUpload(file: File) {
        setLoading(true); setError(null);
        try {
            await uploadSignatureImage(file);
            await onRefresh();
            setEditing(false);
        }
        catch (e: unknown) { setError(e instanceof Error ? e.message : 'Upload failed'); }
        finally {
            setLoading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    async function handleDelete() {
        setDeleting(true); setError(null);
        try {
            await deleteSignatureImage();
            await onRefresh();
            setEditing(false);
        }
        catch (e: unknown) { setError(e instanceof Error ? e.message : 'Failed to remove image'); }
        finally { setDeleting(false); }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault(); setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) validateAndUpload(file);
    }

    const showEditor = !image || editing;

    return (
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 28, boxShadow: 'var(--glass-shadow)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 42, height: 42, borderRadius: 12,
                        background: 'var(--color-primary-subtle)', border: '1px solid var(--color-border-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    }}>✍️</div>
                    <div>
                        <h3 style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            Signature Image
                        </h3>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                            Displayed on printed documents — human readability only
                        </p>
                    </div>
                </div>
                <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    color: 'var(--color-text-muted)', background: 'rgba(22,16,58,0.05)',
                    border: '1px solid rgba(22,16,58,0.10)', borderRadius: 20,
                    padding: '3px 10px', flexShrink: 0,
                }}>OPTIONAL</span>
            </div>

            {/* Trust notice */}
            <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary-subtle)', border: '1px solid var(--color-border-primary)',
                fontSize: 12, color: 'var(--color-primary)', lineHeight: 1.5,
                display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>ℹ️</span>
                <span>This image has <strong>no cryptographic value</strong>. Your legally binding signature is the mathematical certificate above — not this image.</span>
            </div>

            {/* Error */}
            {error && (
                <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)', fontSize: 13, color: 'var(--color-error)' }}>
                    {error}
                </div>
            )}

            {image && !editing ? (
                <>
                    {/* Image preview */}
                    <div style={{
                        marginBottom: 14, padding: '24px 20px',
                        background: 'rgba(91,35,255,0.03)', border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                    }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={image.url}
                            alt="Your signature"
                            style={{ maxWidth: '100%', maxHeight: 100, objectFit: 'contain' }}
                        />
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                            {image.mimeType === 'image/svg+xml' ? 'SVG' : 'PNG'} · {formatBytes(image.sizeBytes)} · uploaded {new Date(image.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                            onClick={() => { setMode('draw'); setEditing(true); setError(null); }}
                            disabled={loading}
                            className="btn-ghost"
                            style={{ flex: 1 }}
                        >
                            Draw New
                        </button>
                        <button
                            onClick={() => { setMode('upload'); setEditing(true); setError(null); }}
                            disabled={loading}
                            className="btn-ghost"
                            style={{ flex: 1 }}
                        >
                            Upload File
                        </button>
                        <button onClick={handleDelete} disabled={deleting} style={{
                            flex: 1, padding: '9px 0', borderRadius: 9999,
                            background: 'var(--color-error-subtle)', border: '1px solid var(--color-error-border)',
                            fontSize: 12, fontWeight: 500, color: 'var(--color-error)',
                            cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1,
                        }}>
                            {deleting ? 'Removing…' : 'Remove'}
                        </button>
                    </div>
                </>
            ) : null}

            {showEditor && (
                <div style={{ display: 'grid', gap: 14 }}>
                    <div
                        style={{
                            display: 'inline-flex',
                            gap: 4,
                            padding: 4,
                            borderRadius: 9999,
                            border: '1px solid var(--color-border)',
                            background: 'rgba(255,255,255,0.54)',
                            width: 'fit-content',
                        }}
                    >
                        {[
                            { id: 'draw', label: 'Draw' },
                            { id: 'upload', label: 'Upload' },
                        ].map((option) => {
                            const active = mode === option.id;

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setMode(option.id as EditorMode)}
                                    style={{
                                        padding: '7px 16px',
                                        borderRadius: 9999,
                                        border: 'none',
                                        background: active ? 'var(--color-primary)' : 'transparent',
                                        color: active ? '#fff' : 'var(--color-text-secondary)',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 150ms ease',
                                    }}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>

                    {mode === 'draw' ? (
                        <SignaturePad
                            saving={loading}
                            onSave={async (file) => {
                                await doUpload(file);
                            }}
                        />
                    ) : (
                        <div
                            onClick={() => !loading && inputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            style={{
                                border: `2px dashed ${dragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                borderRadius: 'var(--radius-lg)', padding: '36px 24px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                background: dragging ? 'var(--color-primary-subtle)' : 'transparent',
                                transition: 'border-color 150ms ease, background 150ms ease',
                                opacity: loading ? 0.6 : 1,
                            }}
                        >
                            <div style={{
                                width: 44, height: 44, borderRadius: 12,
                                background: 'var(--color-primary-subtle)', border: '1px solid var(--color-border-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                            }}>
                                {loading ? '⏳' : '📤'}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                    {loading ? 'Uploading…' : 'Upload signature image'}
                                </p>
                                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                                    PNG or SVG · Max 2 MB · Drag & drop or click
                                </p>
                            </div>
                        </div>
                    )}

                    {image && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => { setEditing(false); setError(null); }}
                                className="btn-ghost"
                                style={{ fontSize: 12 }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/svg+xml"
                onChange={e => { const f = e.target.files?.[0]; if (f) validateAndUpload(f); }}
                style={{ display: 'none' }}
            />
        </div>
    );
}

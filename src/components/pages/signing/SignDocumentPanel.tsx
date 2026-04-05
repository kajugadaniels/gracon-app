'use client';

// Sign Document panel — file upload or manual hash, with zero-knowledge
// SHA-256 computed locally via Web Crypto API before signing.

import { useRef, useState } from 'react';
import { sha256File } from '@/lib/hash';
import { signDocument } from '@/api/signature/signature.api';
import type { SignResponse } from '@/api/signature/signature.api';

export interface SignDocumentPanelProps {
    onSigned: () => void;
}

// ─── Trust banner ─────────────────────────────────────────────────────────────

/** Displays the zero-knowledge privacy assurance. */
function TrustBanner() {
    return (
        <div
            style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                background: 'var(--color-primary-subtle)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 24,
            }}
        >
            <span style={{ fontSize: 14, marginTop: 1 }}>🔒</span>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Zero-knowledge signing</strong>
                {' '}— your file is hashed locally via the Web Crypto API.
                Only the 64-character SHA-256 digest is sent to the server. Your file never leaves your device.
            </p>
        </div>
    );
}

// ─── Mode toggle ──────────────────────────────────────────────────────────────

/** Segmented control to switch between file upload and manual hash modes. */
function ModeToggle({
    mode,
    onChange,
}: {
    mode: 'file' | 'hash';
    onChange: (m: 'file' | 'hash') => void;
}) {
    return (
        <div
            style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2,
                background: 'rgba(91, 35, 255, 0.05)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', padding: 3, marginBottom: 20,
            }}
        >
            {(['file', 'hash'] as const).map((m) => (
                <button
                    key={m}
                    onClick={() => onChange(m)}
                    style={{
                        padding: '9px 0', borderRadius: 9,
                        border: `1px solid ${mode === m ? 'var(--color-border-primary)' : 'transparent'}`,
                        background: mode === m ? 'rgba(255,255,255,0.85)' : 'transparent',
                        color: mode === m ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        fontSize: 13, fontWeight: mode === m ? 600 : 400,
                        cursor: 'pointer', transition: 'all 150ms ease',
                        boxShadow: mode === m ? '0 1px 4px rgba(91,35,255,0.08)' : 'none',
                    }}
                >
                    {m === 'file' ? '📁  Upload File' : '#  Paste Hash'}
                </button>
            ))}
        </div>
    );
}

// ─── File drop zone ───────────────────────────────────────────────────────────

interface FileDropZoneProps {
    file: File | null;
    isDragging: boolean;
    fileRef: React.RefObject<HTMLInputElement>;
    /** Called when a file is selected or dropped. */
    onChange: (f: File) => void;
    onDragChange: (v: boolean) => void;
}

/** Drag-and-drop target or click-to-browse file selector. */
function FileDropZone({ file, isDragging, fileRef, onChange, onDragChange }: FileDropZoneProps) {
    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        onDragChange(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) onChange(dropped);
    }

    const borderColor = file
        ? 'var(--color-success)'
        : isDragging
        ? 'var(--color-primary)'
        : 'var(--color-border)';

    const bgColor = isDragging
        ? 'var(--color-primary-subtle)'
        : file
        ? 'var(--color-success-subtle)'
        : 'rgba(255,255,255,0.4)';

    return (
        <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); onDragChange(true); }}
            onDragLeave={() => onDragChange(false)}
            onDrop={handleDrop}
            style={{
                border: `2px dashed ${borderColor}`, borderRadius: 'var(--radius-lg)',
                padding: '32px 24px', textAlign: 'center', cursor: 'pointer',
                marginBottom: 16, background: bgColor, transition: 'all 200ms ease',
            }}
        >
            {file ? (
                <>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--color-success)' }}>
                        {file.name}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {(file.size / 1024).toFixed(1)} KB · Click to change file
                    </p>
                </>
            ) : (
                <>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📤</div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                        Drop a file here, or click to browse
                    </p>
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
                        Any file type — hash computed locally, never uploaded
                    </p>
                </>
            )}
        </div>
    );
}

// ─── Copy field ───────────────────────────────────────────────────────────────

interface CopyFieldProps {
    label: string;
    value: string;
    /** Render value in monospace font. */
    mono?: boolean;
    /** Clip to single line instead of wrapping. */
    truncate?: boolean;
}

/** Label + value block with a copy-to-clipboard button. */
function CopyField({ label, value, mono, truncate }: CopyFieldProps) {
    const [copied, setCopied] = useState(false);

    function copy() {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div style={{ marginBottom: 12 }}>
            <p
                style={{
                    margin: '0 0 4px', fontSize: 11, fontWeight: 600,
                    color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em',
                }}
            >
                {label}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                    style={{
                        flex: 1, background: 'rgba(255,255,255,0.6)',
                        border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                        padding: '8px 10px', fontSize: 12,
                        fontFamily: mono ? 'monospace' : 'inherit',
                        color: 'var(--color-text-primary)',
                        ...(truncate
                            ? { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                            : { wordBreak: 'break-all', maxHeight: 56, overflowY: 'auto' }),
                    }}
                >
                    {value}
                </div>
                <button
                    onClick={copy}
                    style={{
                        flexShrink: 0, padding: '7px 12px',
                        background: copied ? 'var(--color-success-subtle)' : 'rgba(91,35,255,0.06)',
                        border: `1px solid ${copied ? 'var(--color-success-border)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-sm)', fontSize: 11,
                        color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)',
                        cursor: 'pointer', transition: 'all 150ms ease', whiteSpace: 'nowrap',
                    }}
                >
                    {copied ? '✓ Copied' : 'Copy'}
                </button>
            </div>
        </div>
    );
}

// ─── Sign result ──────────────────────────────────────────────────────────────

interface SignResultProps {
    result: SignResponse;
    onReset: () => void;
}

/** Success card showing all fields of the completed signature. */
function SignResult({ result, onReset }: SignResultProps) {
    return (
        <div
            className="animate-fade-up"
            style={{
                background: 'var(--color-success-subtle)',
                border: '1px solid var(--color-success-border)',
                borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 16,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div
                    style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(5,150,105,0.15)',
                        border: '1px solid var(--color-success-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                    }}
                >
                    ✅
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--color-success)' }}>
                        Document Signed Successfully
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {result.documentName} · {new Date(result.signedAt).toLocaleString()}
                    </p>
                </div>
            </div>

            <CopyField label="Signature ID" value={result.signatureId} mono truncate />
            <CopyField label="Document Hash (SHA-256)" value={result.documentHash} mono />
            <CopyField label="Signature Bytes (base64)" value={result.signatureBytes} mono />
            <CopyField label="Certificate ID" value={result.certificateId} mono truncate />

            <button onClick={onReset} className="btn-ghost" style={{ width: '100%', marginTop: 8 }}>
                Sign Another Document
            </button>
        </div>
    );
}

// ─── Hash input ───────────────────────────────────────────────────────────────

/** Manual SHA-256 hash paste input with a 64-char counter. */
function HashInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label
                style={{
                    display: 'block', fontSize: 11, fontWeight: 600,
                    color: 'var(--color-text-muted)', marginBottom: 6,
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                }}
            >
                SHA-256 Hash
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="e3b0c44298fc1c149afb4c8996fb92427ae41e4649b934ca495991b7852b855"
                    className="input-glass"
                    style={{ fontFamily: 'monospace', fontSize: 12, paddingRight: 60 }}
                />
                <span
                    style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 11, fontFamily: 'monospace', fontWeight: 600, pointerEvents: 'none',
                        color: value.length === 64 ? 'var(--color-success)' : 'var(--color-text-muted)',
                    }}
                >
                    {value.length}/64
                </span>
            </div>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Full sign-a-document workflow: mode selection, file drop or manual hash,
 * document name entry, SHA-256 computation, API call, and result display.
 */
export function SignDocumentPanel({ onSigned }: SignDocumentPanelProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<'file' | 'hash'>('file');
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [manualHash, setManualHash] = useState('');
    const [documentName, setDocumentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SignResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    function handleFile(f: File) {
        setFile(f);
        if (!documentName) setDocumentName(f.name);
        setResult(null);
        setError(null);
    }

    function handleModeChange(m: 'file' | 'hash') {
        setMode(m);
        setResult(null);
        setError(null);
    }

    async function handleSign() {
        setError(null);
        setResult(null);
        if (!documentName.trim()) { setError('Please enter a document name.'); return; }

        let hash: string;
        if (mode === 'file') {
            if (!file) { setError('Please select a file.'); return; }
            setLoading(true);
            try { hash = await sha256File(file); }
            catch { setError('Failed to compute file hash.'); setLoading(false); return; }
        } else {
            hash = manualHash.trim().toLowerCase();
            if (!/^[0-9a-f]{64}$/.test(hash)) {
                setError('Hash must be exactly 64 lowercase hex characters (SHA-256).');
                return;
            }
            setLoading(true);
        }

        try {
            const res = await signDocument(hash, documentName.trim());
            setResult(res);
            onSigned();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Signing failed');
        } finally {
            setLoading(false);
        }
    }

    function reset() {
        setFile(null); setManualHash(''); setDocumentName('');
        setResult(null); setError(null);
        if (fileRef.current) fileRef.current.value = '';
    }

    return (
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: 28 }}>
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div
                    style={{
                        width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                        background: 'var(--color-primary-subtle)',
                        border: '1px solid var(--color-border-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}
                >
                    ✍️
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Sign a Document
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)' }}>
                        Upload a file or paste a SHA-256 hash to begin
                    </p>
                </div>
            </div>

            <div style={{ height: 1, background: 'var(--color-border)', margin: '18px 0' }} />

            <TrustBanner />

            {result ? (
                <SignResult result={result} onReset={reset} />
            ) : (
                <>
                    <ModeToggle mode={mode} onChange={handleModeChange} />

                    {mode === 'file' ? (
                        <FileDropZone
                            file={file} isDragging={isDragging}
                            fileRef={fileRef as React.RefObject<HTMLInputElement>}
                            onChange={handleFile} onDragChange={setIsDragging}
                        />
                    ) : (
                        <HashInput value={manualHash} onChange={setManualHash} />
                    )}

                    <div style={{ marginBottom: 20 }}>
                        <label
                            style={{
                                display: 'block', fontSize: 11, fontWeight: 600,
                                color: 'var(--color-text-muted)', marginBottom: 6,
                                textTransform: 'uppercase', letterSpacing: '0.07em',
                            }}
                        >
                            Document Name
                        </label>
                        <input
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            placeholder="e.g. Service Agreement Q2 2026"
                            className="input-glass"
                        />
                    </div>

                    {error && (
                        <div
                            style={{
                                background: 'var(--color-error-subtle)',
                                border: '1px solid var(--color-error-border)',
                                borderRadius: 'var(--radius-md)', padding: '10px 14px',
                                fontSize: 13, color: 'var(--color-error)', marginBottom: 16,
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button onClick={handleSign} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                <span className="btn-spinner" /> Computing hash and signing…
                            </span>
                        ) : '✍️  Sign Document'}
                    </button>
                </>
            )}

            <input
                ref={fileRef}
                type="file"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                style={{ display: 'none' }}
            />
        </div>
    );
}

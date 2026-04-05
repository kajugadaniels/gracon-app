'use client';

import { useRef, useState } from 'react';
import { sha256File, sha256Text } from '@/lib/hash';
import { signDocument } from '@/api/signature/signature.api';
import type { SignResponse } from '@/api/signature/signature.api';

interface SignDocumentPanelProps {
    onSigned: () => void;
}

export function SignDocumentPanel({ onSigned }: SignDocumentPanelProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<'file' | 'hash'>('file');
    const [file, setFile] = useState<File | null>(null);
    const [manualHash, setManualHash] = useState('');
    const [documentName, setDocumentName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SignResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;
        setFile(f);
        if (f && !documentName) setDocumentName(f.name);
        setResult(null);
        setError(null);
    }

    async function handleSign() {
        setError(null);
        setResult(null);

        if (!documentName.trim()) {
            setError('Please enter a document name.');
            return;
        }

        let hash: string;

        if (mode === 'file') {
            if (!file) { setError('Please select a file.'); return; }
            setLoading(true);
            try {
                hash = await sha256File(file);
            } catch {
                setError('Failed to compute file hash.');
                setLoading(false);
                return;
            }
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
            const msg = e instanceof Error ? e.message : 'Signing failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    function copyResult(text: string) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function reset() {
        setFile(null);
        setManualHash('');
        setDocumentName('');
        setResult(null);
        setError(null);
        if (fileRef.current) fileRef.current.value = '';
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
            <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                Sign a Document
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--text-muted)' }}>
                Upload a file to compute its hash automatically, or paste a SHA-256 hash directly.
            </p>

            {/* Mode toggle */}
            <div
                style={{
                    display: 'flex', gap: 2, padding: 3,
                    background: 'var(--glass-interactive)',
                    border: '1px solid var(--glass-interactive-border)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 20,
                }}
            >
                {(['file', 'hash'] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => { setMode(m); setResult(null); setError(null); }}
                        style={{
                            flex: 1, padding: '8px 0', borderRadius: 8,
                            border: `1px solid ${mode === m ? 'var(--primary-border)' : 'transparent'}`,
                            background: mode === m ? 'var(--primary-glass)' : 'transparent',
                            color: mode === m ? 'var(--primary-text)' : 'var(--text-muted)',
                            fontSize: 13, fontWeight: mode === m ? 600 : 400,
                            cursor: 'pointer', transition: 'all 150ms ease',
                        }}
                    >
                        {m === 'file' ? '📁 Upload File' : '# Paste Hash'}
                    </button>
                ))}
            </div>

            {/* Input area */}
            {mode === 'file' ? (
                <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                        border: `2px dashed ${file ? 'var(--success)' : 'var(--glass-card-border)'}`,
                        borderRadius: 'var(--radius-md)', padding: 24,
                        textAlign: 'center', cursor: 'pointer', marginBottom: 16,
                        transition: 'border-color 150ms ease',
                    }}
                    onMouseEnter={e => !file && (e.currentTarget.style.borderColor = 'var(--primary-border)')}
                    onMouseLeave={e => !file && (e.currentTarget.style.borderColor = 'var(--glass-card-border)')}
                >
                    {file ? (
                        <div>
                            <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--success-text)' }}>
                                {file.name}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                                {(file.size / 1024).toFixed(1)} KB · Click to change
                            </p>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontSize: 28, marginBottom: 8 }}>📤</div>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
                                Click to select any file
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                                The SHA-256 hash is computed locally — your file never leaves your device
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        SHA-256 Hash (64 hex characters)
                    </label>
                    <input
                        value={manualHash}
                        onChange={e => setManualHash(e.target.value)}
                        placeholder="e3b0c44298fc1c149afb…"
                        style={{
                            width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                            background: 'var(--glass-interactive)',
                            border: '1px solid var(--glass-interactive-border)',
                            color: 'var(--text-primary)', fontSize: 13,
                            fontFamily: 'monospace', outline: 'none',
                        }}
                    />
                </div>
            )}

            {/* Document name */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Document Name
                </label>
                <input
                    value={documentName}
                    onChange={e => setDocumentName(e.target.value)}
                    placeholder="e.g. Service Agreement Q2 2026"
                    style={{
                        width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)',
                        background: 'var(--glass-interactive)',
                        border: '1px solid var(--glass-interactive-border)',
                        color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                    }}
                />
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

            {/* Result */}
            {result ? (
                <div
                    style={{
                        background: 'var(--success-glass)', border: '1px solid var(--success-border)',
                        borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <span style={{ fontSize: 20 }}>✅</span>
                        <div>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--success-text)' }}>
                                Document signed successfully
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                                {new Date(result.signedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Signature bytes with copy */}
                    <div>
                        <p style={{ margin: '0 0 6px', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Signature Bytes (base64)
                        </p>
                        <div style={{ position: 'relative' }}>
                            <div
                                style={{
                                    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-card-border)',
                                    borderRadius: 'var(--radius-md)', padding: '10px 12px',
                                    fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)',
                                    wordBreak: 'break-all', maxHeight: 80, overflowY: 'auto',
                                    paddingRight: 70,
                                }}
                            >
                                {result.signatureBytes}
                            </div>
                            <button
                                onClick={() => copyResult(result.signatureBytes)}
                                style={{
                                    position: 'absolute', top: 8, right: 8,
                                    background: copied ? 'var(--success-glass)' : 'var(--glass-interactive)',
                                    border: `1px solid ${copied ? 'var(--success-border)' : 'var(--glass-interactive-border)'}`,
                                    borderRadius: 6, padding: '3px 10px',
                                    fontSize: 11, color: copied ? 'var(--success-text)' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                }}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={reset}
                        style={{
                            marginTop: 14, width: '100%',
                            background: 'var(--glass-interactive)',
                            border: '1px solid var(--glass-interactive-border)',
                            borderRadius: 'var(--radius-md)', padding: '9px 0',
                            fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer',
                        }}
                    >
                        Sign Another Document
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleSign}
                    disabled={loading}
                    className="btn-primary"
                    style={{ width: '100%' }}
                >
                    {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                            <span className="btn-spinner" /> Signing…
                        </span>
                    ) : '✍️  Sign Document'}
                </button>
            )}

            <input ref={fileRef} type="file" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>
    );
}

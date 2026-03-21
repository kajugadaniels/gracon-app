'use client';

import { useRef, useState, DragEvent, ChangeEvent } from 'react';

interface DocumentUploadProps {
    label: string;
    hint: string;
    file: File | null;
    onChange: (file: File) => void;
    error?: string;
    disabled?: boolean;
}

// Drag-and-drop + click-to-upload file input
// Shows preview when image is selected
export function DocumentUpload({
    label,
    hint,
    file,
    onChange,
    error,
    disabled = false,
}: DocumentUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFile = (selected: File) => {
        if (!selected.type.startsWith('image/')) return;
        onChange(selected);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(selected);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFile(dropped);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) handleFile(selected);
    };

    const borderColor = error
        ? 'var(--color-error-border)'
        : dragging
            ? 'var(--color-primary)'
            : file
                ? 'var(--color-success-border)'
                : 'var(--color-border)';

    const bgColor = error
        ? 'var(--color-error-subtle)'
        : dragging
            ? 'var(--color-primary-subtle)'
            : file
                ? 'var(--color-success-subtle)'
                : 'var(--color-bg-elevated)';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Label */}
            <span
                style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                }}
            >
                {label}
            </span>

            {/* Drop zone */}
            <div
                role="button"
                tabIndex={0}
                aria-label={`Upload ${label}`}
                onClick={() => !disabled && inputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                    border: `2px dashed ${borderColor}`,
                    borderRadius: 'var(--radius-md)',
                    background: bgColor,
                    padding: '20px 14px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    minHeight: 148,
                    transition: 'all 180ms ease',
                    outline: 'none',
                    opacity: disabled ? 0.5 : 1,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Image preview */}
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 'calc(var(--radius-md) - 2px)',
                                opacity: 0.28,
                            }}
                        />
                        {/* Overlay with checkmark */}
                        <div
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 7,
                            }}
                        >
                            <span
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: 'var(--color-success)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 14,
                                    color: '#fff',
                                }}
                            >
                                ✓
                            </span>
                            <span
                                style={{
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: 'var(--color-success)',
                                }}
                            >
                                {file?.name}
                            </span>
                            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                                Click to change
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Upload icon */}
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: '50%',
                                background: 'rgba(91,35,255,0.08)',
                                border: '1px solid var(--color-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 180ms ease',
                            }}
                        >
                            <svg
                                width="20" height="20" viewBox="0 0 24 24"
                                fill="none" stroke="var(--color-primary)"
                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div
                                style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: 'var(--color-text-primary)',
                                    marginBottom: 3,
                                }}
                            >
                                {dragging ? 'Drop to upload' : 'Click or drag to upload'}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                                {hint}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Hidden input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleChange}
                disabled={disabled}
            />

            {/* Error */}
            {error && (
                <p
                    role="alert"
                    className="animate-fade-in"
                    style={{ fontSize: 12, color: 'var(--color-error)', margin: 0 }}
                >
                    {error}
                </p>
            )}
        </div>
    );
}

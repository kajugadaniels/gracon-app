'use client';

/**
 * Shared presentation helpers for the verification camera widget.
 */

import Image from 'next/image';
import type { QualityResult } from './hooks/useCamera';

const ghostButtonStyle = {
    width: '100%',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    padding: '13px 16px',
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    background: 'var(--color-surface)',
    cursor: 'pointer',
} as const;

const smallButtonStyle = {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    padding: '10px 14px',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    background: 'var(--color-surface)',
    cursor: 'pointer',
} as const;

/**
 * Renders the live quality indicator for the current camera frame.
 */
export function CameraQualityBar({ quality }: { quality: QualityResult }) {
    const icons: Record<QualityResult['label'], string> = {
        loading: '⟳',
        dark: '🔅',
        bright: '☀',
        blurry: '〰',
        good: '✓',
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 8,
                background: 'rgba(0,0,0,0.60)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${quality.color}44`,
                transition: 'border-color 300ms ease',
                minWidth: 240,
            }}
        >
            <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
                {icons[quality.label]}
            </span>
            <div
                style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}
            >
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: quality.color,
                        lineHeight: 1.3,
                    }}
                >
                    {quality.message}
                </span>
                <div
                    style={{
                        height: 3,
                        background: 'rgba(255,255,255,0.12)',
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            width: `${quality.score}%`,
                            background: quality.color,
                            borderRadius: 2,
                            transition: 'width 400ms ease, background 400ms ease',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * Shows a camera-permission failure state and retry action.
 */
export function CameraPermissionDenied({
    error,
    onRetry,
}: {
    error: string;
    onRetry: () => void;
}) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: 40,
                textAlign: 'center',
                minHeight: 360,
            }}
        >
            <div
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--color-error-subtle)',
                    border: '2px solid var(--color-error-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                }}
            >
                ⊘
            </div>
            <div>
                <div
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        marginBottom: 8,
                    }}
                >
                    Camera access required
                </div>
                <div
                    style={{
                        fontSize: 13,
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                        maxWidth: 320,
                    }}
                >
                    {error}
                </div>
            </div>
            <button type="button" onClick={onRetry} style={smallButtonStyle}>
                Try again
            </button>
        </div>
    );
}

/**
 * Displays the captured image and a retake action.
 */
export function CameraCaptureReview({
    imageUrl,
    mode,
    onRetake,
}: {
    imageUrl: string;
    mode: 'id-card' | 'selfie';
    onRetake: () => void;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
                style={{
                    position: 'relative',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '2px solid var(--color-success-border)',
                    aspectRatio: mode === 'id-card' ? '16/10' : '3/4',
                    background: '#000',
                }}
            >
                <Image
                    src={imageUrl}
                    alt="Captured"
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 90vw, 520px"
                    style={{ objectFit: 'cover' }}
                />
                <div
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'rgba(0,0,0,0.65)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid var(--color-success-border)',
                        borderRadius: 20,
                        padding: '5px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-success)',
                    }}
                >
                    <span>✓</span>
                    <span>Captured</span>
                </div>
            </div>

            <button type="button" onClick={onRetake} style={ghostButtonStyle}>
                Retake photo
            </button>
        </div>
    );
}

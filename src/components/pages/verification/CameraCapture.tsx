'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import { useCamera, type CameraFacing, type QualityResult } from './hooks/useCamera';

interface CameraCaptureProps {
    // "id-card" = back camera default, "selfie" = front camera default
    mode: 'id-card' | 'selfie';
    onCapture: (dataUrl: string, file: File) => void;
    onRetake?: () => void;
    // Pass captured state up so parent knows when step is complete
    captured: boolean;
}

// ── Quality indicator bar ─────────────────────────────────────

function QualityBar({ quality }: { quality: QualityResult }) {
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
            {/* Icon */}
            <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>
                {icons[quality.label]}
            </span>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Message */}
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

                {/* Score bar */}
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

// ── Permission denied screen ──────────────────────────────────

function PermissionDenied({
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
            <Button onClick={onRetry} size="sm">
                Try again
            </Button>
        </div>
    );
}

// ── Captured image review ─────────────────────────────────────

function CaptureReview({
    dataUrl: imageUrl,
    mode,
    onRetake,
}: {
    dataUrl: string;
    mode: 'id-card' | 'selfie';
    onRetake: () => void;
}) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            }}
        >
            {/* Preview */}
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
                <img
                    src={imageUrl}
                    alt="Captured"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                    }}
                />

                {/* Success overlay badge */}
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

            {/* Retake button */}
            <Button
                variant="ghost"
                fullWidth
                onClick={onRetake}
                leftIcon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 4v6h-6" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                }
            >
                Retake photo
            </Button>
        </div>
    );
}

// ── Main CameraCapture component ──────────────────────────────

export function CameraCapture({
    mode,
    onCapture,
    onRetake,
    captured,
}: CameraCaptureProps) {
    const defaultFacing: CameraFacing =
        mode === 'selfie' ? 'user' : 'environment';

    const {
        videoRef,
        canvasRef,
        isReady,
        hasPermission,
        permissionError,
        facing,
        quality,
        capturedImage,
        isAnalyzing,
        startCamera,
        flipCamera,
        capture,
        retake,
    } = useCamera({
        facing: defaultFacing,
        onCapture,
    });

    // Start camera on mount
    useEffect(() => {
        startCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRetake = () => {
        retake();
        onRetake?.();
    };

    // ── Permission denied state
    if (hasPermission === false && permissionError) {
        return (
            <PermissionDenied
                error={permissionError}
                onRetry={startCamera}
            />
        );
    }

    // ── Captured — show review
    if (capturedImage) {
        return (
            <CaptureReview
                dataUrl={capturedImage}
                mode={mode}
                onRetake={handleRetake}
            />
        );
    }

    // ── Camera viewfinder
    const aspectRatio = mode === 'id-card' ? '16/10' : '3/4';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Viewfinder container */}
            <div
                style={{
                    position: 'relative',
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: '#000',
                    aspectRatio,
                    border: `2px solid ${quality.label === 'good'
                            ? 'var(--color-success-border)'
                            : quality.label === 'loading'
                                ? 'var(--color-border)'
                                : `${quality.color}66`
                        }`,
                    transition: 'border-color 400ms ease',
                }}
            >
                {/* Video stream */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        // Mirror front camera so it feels like a mirror
                        transform: facing === 'user' ? 'scaleX(-1)' : 'none',
                    }}
                />

                {/* Hidden canvas for frame analysis and capture */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* ID card overlay guide — only in id-card mode */}
                {mode === 'id-card' && isReady && !capturedImage && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                        }}
                    >
                        {/* Card outline guide */}
                        <div
                            style={{
                                width: '82%',
                                height: '72%',
                                border: '2px dashed rgba(255,255,255,0.45)',
                                borderRadius: 8,
                                boxShadow: 'inset 0 0 0 4000px rgba(0,0,0,0.15)',
                            }}
                        >
                            {/* Corner markers */}
                            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(
                                (corner) => {
                                    const isTop = corner.includes('top');
                                    const isLeft = corner.includes('left');
                                    return (
                                        <div
                                            key={corner}
                                            style={{
                                                position: 'absolute',
                                                top: isTop ? -2 : undefined,
                                                bottom: !isTop ? -2 : undefined,
                                                left: isLeft ? -2 : undefined,
                                                right: !isLeft ? -2 : undefined,
                                                width: 20,
                                                height: 20,
                                                borderTop: isTop ? '3px solid #fff' : 'none',
                                                borderBottom: !isTop ? '3px solid #fff' : 'none',
                                                borderLeft: isLeft ? '3px solid #fff' : 'none',
                                                borderRight: !isLeft ? '3px solid #fff' : 'none',
                                                borderTopLeftRadius: (isTop && isLeft) ? 4 : 0,
                                                borderTopRightRadius: (isTop && !isLeft) ? 4 : 0,
                                                borderBottomLeftRadius: (!isTop && isLeft) ? 4 : 0,
                                                borderBottomRightRadius: (!isTop && !isLeft) ? 4 : 0,
                                            }}
                                        />
                                    );
                                },
                            )}
                        </div>
                    </div>
                )}

                {/* Selfie face guide oval */}
                {mode === 'selfie' && isReady && !capturedImage && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'none',
                        }}
                    >
                        <div
                            style={{
                                width: '65%',
                                height: '75%',
                                border: '2px dashed rgba(255,255,255,0.45)',
                                borderRadius: '50%',
                            }}
                        />
                    </div>
                )}

                {/* Loading overlay */}
                {(isAnalyzing || !isReady) && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(7,7,26,0.75)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                border: '3px solid rgba(255,255,255,0.12)',
                                borderTopColor: 'var(--color-primary)',
                                borderRadius: '50%',
                                animation: 'btn-spin 0.75s linear infinite',
                            }}
                        />
                        <span
                            style={{
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.7)',
                                fontWeight: 500,
                            }}
                        >
                            Starting camera...
                        </span>
                    </div>
                )}

                {/* Top controls bar — flip camera button */}
                {isReady && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            display: 'flex',
                            gap: 8,
                        }}
                    >
                        {/* Flip camera */}
                        <button
                            onClick={flipCamera}
                            aria-label="Flip camera"
                            title={`Switch to ${facing === 'user' ? 'back' : 'front'} camera`}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'rgba(0,0,0,0.55)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.20)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                transition: 'background 150ms ease',
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.background = 'rgba(0,0,0,0.80)')
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')
                            }
                        >
                            <svg
                                width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <path d="M20 7h-3a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                                <circle cx="12" cy="13" r="3" />
                                <path d="M14 2h-4l-1 2h6l-1-2z" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Camera label */}
                {isReady && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            background: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: 20,
                            padding: '4px 10px',
                            fontSize: 11,
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.80)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                        }}
                    >
                        <span style={{ fontSize: 9 }}>●</span>
                        {facing === 'user' ? 'Front camera' : 'Back camera'}
                    </div>
                )}
            </div>

            {/* Quality indicator */}
            {isReady && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <QualityBar quality={quality} />
                </div>
            )}

            {/* Capture button */}
            {isReady && (
                <Button
                    fullWidth
                    onClick={capture}
                    disabled={!quality.canCapture}
                    size="lg"
                    style={{
                        opacity: quality.canCapture ? 1 : 0.5,
                        transition: 'opacity 300ms ease',
                    }}
                    leftIcon={
                        <svg
                            width="18" height="18" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
                        </svg>
                    }
                >
                    {quality.canCapture
                        ? `Capture ${mode === 'id-card' ? 'ID card' : 'selfie'}`
                        : quality.message}
                </Button>
            )}

            {/* Guidance tip */}
            {isReady && mode === 'id-card' && (
                <p
                    style={{
                        textAlign: 'center',
                        fontSize: 12,
                        color: 'var(--color-text-muted)',
                        margin: 0,
                        lineHeight: 1.5,
                    }}
                >
                    Align your ID card within the dashed border — ensure all four corners are visible
                </p>
            )}

            {isReady && mode === 'selfie' && (
                <p
                    style={{
                        textAlign: 'center',
                        fontSize: 12,
                        color: 'var(--color-text-muted)',
                        margin: 0,
                        lineHeight: 1.5,
                    }}
                >
                    Position your face inside the oval — look directly at the camera
                </p>
            )}
        </div>
    );
}
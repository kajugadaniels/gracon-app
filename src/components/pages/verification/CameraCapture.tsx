'use client';

/**
 * Main-app camera capture widget built on the shared camera layer.
 */

import { useEffect } from 'react';
import {
    CameraCaptureReview,
    CameraPermissionDenied,
    CameraQualityBar,
    useCamera,
    type CameraFacing,
} from '@gracon/verification-ui';
import { Button } from '@/components/ui';
import { PremiumLoader } from '@/components/ui/Loader';

interface CameraCaptureProps {
    mode: 'id-card' | 'selfie';
    onCapture: (dataUrl: string, file: File) => void;
    onRetake?: () => void;
    captured: boolean;
}

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

    useEffect(() => {
        void startCamera();
    }, [startCamera]);

    const handleRetake = () => {
        retake();
        onRetake?.();
    };

    if (hasPermission === false && permissionError) {
        return (
            <CameraPermissionDenied
                error={permissionError}
                onRetry={startCamera}
            />
        );
    }

    if (capturedImage) {
        return (
            <CameraCaptureReview
                imageUrl={capturedImage}
                mode={mode}
                onRetake={handleRetake}
            />
        );
    }

    // ── Camera viewfinder
    const aspectRatio = mode === 'id-card' ? '16/10' : '3/4';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                        transform: facing === 'user' ? 'scaleX(-1)' : 'none',
                    }}
                />

                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {mode === 'id-card' && isReady && !captured && (
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
                                width: '82%',
                                height: '72%',
                                border: '2px dashed rgba(255,255,255,0.45)',
                                borderRadius: 8,
                                boxShadow: 'inset 0 0 0 4000px rgba(0,0,0,0.15)',
                            }}
                        >
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

                {mode === 'selfie' && isReady && !captured && (
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
                        <PremiumLoader size={36} color="primary" />
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

            {isReady && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CameraQualityBar quality={quality} />
                </div>
            )}

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

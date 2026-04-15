'use client';

/**
 * Shared camera viewport shell for verification capture flows.
 */

import type { RefObject, ReactNode } from 'react';
import type { CameraFacing, QualityResult } from './hooks/useCamera';
import { CameraQualityBar } from './CameraCaptureUi';

export type VerificationCameraMode = 'id-card' | 'selfie';

type VerificationCameraViewportProps = {
    mode: VerificationCameraMode;
    captured: boolean;
    isReady: boolean;
    isAnalyzing: boolean;
    facing: CameraFacing;
    quality: QualityResult;
    videoRef: RefObject<HTMLVideoElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    onFlipCamera: () => void;
    loadingOverlaySlot: ReactNode;
};

function borderColorForQuality(quality: QualityResult) {
    if (quality.label === 'good') {
        return 'var(--color-success-border)';
    }
    if (quality.label === 'loading') {
        return 'var(--color-border)';
    }
    return `${quality.color}66`;
}

function renderIdCardGuide() {
    return (
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
                                borderBottom: !isTop
                                    ? '3px solid #fff'
                                    : 'none',
                                borderLeft: isLeft
                                    ? '3px solid #fff'
                                    : 'none',
                                borderRight: !isLeft
                                    ? '3px solid #fff'
                                    : 'none',
                                borderTopLeftRadius: isTop && isLeft ? 4 : 0,
                                borderTopRightRadius:
                                    isTop && !isLeft ? 4 : 0,
                                borderBottomLeftRadius:
                                    !isTop && isLeft ? 4 : 0,
                                borderBottomRightRadius:
                                    !isTop && !isLeft ? 4 : 0,
                            }}
                        />
                    );
                },
            )}
        </div>
    );
}

function renderSelfieGuide() {
    return (
        <div
            style={{
                width: '65%',
                height: '75%',
                border: '2px dashed rgba(255,255,255,0.45)',
                borderRadius: '50%',
            }}
        />
    );
}

/**
 * Renders the shared live camera viewport, guides, controls, and quality bar.
 */
export function VerificationCameraViewport({
    mode,
    captured,
    isReady,
    isAnalyzing,
    facing,
    quality,
    videoRef,
    canvasRef,
    onFlipCamera,
    loadingOverlaySlot,
}: VerificationCameraViewportProps) {
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
                    border: `2px solid ${borderColorForQuality(quality)}`,
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

                {isReady && !captured && (
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
                        {mode === 'id-card'
                            ? renderIdCardGuide()
                            : renderSelfieGuide()}
                    </div>
                )}

                {(isAnalyzing || !isReady) && loadingOverlaySlot}

                {isReady && (
                    <>
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
                                type="button"
                                onClick={onFlipCamera}
                                aria-label="Flip camera"
                                title={`Switch to ${
                                    facing === 'user' ? 'back' : 'front'
                                } camera`}
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
                                }}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M20 7h-3a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                                    <circle cx="12" cy="13" r="3" />
                                    <path d="M14 2h-4l-1 2h6l-1-2z" />
                                </svg>
                            </button>
                        </div>

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
                    </>
                )}
            </div>

            {isReady && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CameraQualityBar quality={quality} />
                </div>
            )}
        </div>
    );
}

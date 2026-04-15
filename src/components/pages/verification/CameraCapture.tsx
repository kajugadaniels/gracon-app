'use client';

/**
 * Main-app camera capture widget built on the shared camera layer.
 */

import { useEffect } from 'react';
import {
    CameraCaptureReview,
    CameraPermissionDenied,
    VerificationCameraViewport,
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <VerificationCameraViewport
                mode={mode}
                captured={captured}
                isReady={isReady}
                isAnalyzing={isAnalyzing}
                facing={facing}
                quality={quality}
                videoRef={videoRef}
                canvasRef={canvasRef}
                onFlipCamera={flipCamera}
                loadingOverlaySlot={
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
                }
            />

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

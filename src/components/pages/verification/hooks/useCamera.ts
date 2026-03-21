'use client';

import {
    useState,
    useRef,
    useCallback,
    useEffect,
} from 'react';

// Image quality assessment result
export interface QualityResult {
    score: number;           // 0-100
    label: 'good' | 'dark' | 'bright' | 'blurry' | 'loading';
    message: string;           // human-readable guidance
    canCapture: boolean;          // whether conditions are good enough
    color: string;           // UI accent color for this state
}

export type CameraFacing = 'user' | 'environment';

interface UseCameraOptions {
    facing?: CameraFacing;
    onCapture?: (dataUrl: string, file: File) => void;
}

interface UseCameraReturn {
    // Refs
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;

    // State
    isReady: boolean;      // camera stream active
    hasPermission: boolean | null; // null = not asked yet
    permissionError: string | null;
    facing: CameraFacing;
    quality: QualityResult;
    capturedImage: string | null; // data URL of captured frame
    isAnalyzing: boolean;

    // Actions
    startCamera: () => Promise<void>;
    stopCamera: () => void;
    flipCamera: () => void;
    capture: () => void;
    retake: () => void;
}

// Brightness thresholds (0-255 pixel average)
const DARK_THRESHOLD = 55;
const BRIGHT_THRESHOLD = 215;

// How often to analyze frame quality (ms)
const ANALYSIS_INTERVAL = 800;

export function useCamera({
    facing: initialFacing = 'environment',
    onCapture,
}: UseCameraOptions = {}): UseCameraReturn {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [facing, setFacing] = useState<CameraFacing>(initialFacing);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [quality, setQuality] = useState<QualityResult>({
        score: 0,
        label: 'loading',
        message: 'Starting camera...',
        canCapture: false,
        color: 'var(--color-text-muted)',
    });

    // ── Stop stream helper ────────────────────────────────────────
    const stopStream = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        setIsReady(false);
    }, []);

    // ── Analyze a video frame for brightness / blur ───────────────
    const analyzeFrame = useCallback((): QualityResult => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) {
            return {
                score: 0,
                label: 'loading',
                message: 'Starting camera...',
                canCapture: false,
                color: 'var(--color-text-muted)',
            };
        }

        // Draw current frame to off-screen canvas for pixel analysis
        const ctx = canvas.getContext('2d');
        if (!ctx) return { score: 0, label: 'loading', message: 'Loading...', canCapture: false, color: 'var(--color-text-muted)' };

        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Calculate average brightness across all pixels
        let totalBrightness = 0;
        let pixelCount = 0;

        for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel for performance
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Perceived brightness formula (weighted RGB)
            totalBrightness += (r * 0.299 + g * 0.587 + b * 0.114);
            pixelCount++;
        }

        const avgBrightness = pixelCount > 0 ? totalBrightness / pixelCount : 0;

        // Calculate blur using Laplacian variance (edge detection)
        // High variance = sharp, low variance = blurry
        const grayData: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
            grayData.push(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        }

        const w = canvas.width;
        let laplacianSum = 0;
        let laplacianCount = 0;

        for (let y = 1; y < canvas.height - 1; y += 4) {
            for (let x = 1; x < w - 1; x += 4) {
                const idx = y * w + x;
                const laplacian = Math.abs(
                    -grayData[idx - w - 1] - grayData[idx - w] - grayData[idx - w + 1]
                    - grayData[idx - 1] + 8 * grayData[idx] - grayData[idx + 1]
                    - grayData[idx + w - 1] - grayData[idx + w] - grayData[idx + w + 1],
                );
                laplacianSum += laplacian;
                laplacianCount++;
            }
        }

        const sharpness = laplacianCount > 0 ? laplacianSum / laplacianCount : 0;

        // ── Determine quality result ──────────────────────────────────
        if (avgBrightness < DARK_THRESHOLD) {
            return {
                score: Math.round((avgBrightness / DARK_THRESHOLD) * 40),
                label: 'dark',
                message: 'Too dark — move to a brighter area or turn on a light',
                canCapture: false,
                color: 'var(--color-error)',
            };
        }

        if (avgBrightness > BRIGHT_THRESHOLD) {
            return {
                score: 60,
                label: 'bright',
                message: 'Too bright — avoid direct light pointing at the camera',
                canCapture: false,
                color: 'var(--color-warning)',
            };
        }

        if (sharpness < 3) {
            return {
                score: 50,
                label: 'blurry',
                message: 'Image is blurry — hold the camera steady',
                canCapture: false,
                color: 'var(--color-warning)',
            };
        }

        // Good conditions — calculate a quality score
        const brightnessScore = 100 - Math.abs(avgBrightness - 130) * 0.8;
        const sharpnessScore = Math.min(100, sharpness * 3);
        const score = Math.round((brightnessScore + sharpnessScore) / 2);

        return {
            score: Math.min(100, Math.max(60, score)),
            label: 'good',
            message: 'Lighting looks good — ready to capture',
            canCapture: true,
            color: 'var(--color-success)',
        };
    }, []);

    // ── Start camera stream ───────────────────────────────────────
    const startCamera = useCallback(async () => {
        stopStream();
        setIsReady(false);
        setIsAnalyzing(true);
        setPermissionError(null);

        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: facing,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: false,
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            setHasPermission(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setIsReady(true);
                setIsAnalyzing(false);

                // Start periodic quality analysis
                intervalRef.current = setInterval(() => {
                    const result = analyzeFrame();
                    setQuality(result);
                }, ANALYSIS_INTERVAL);
            }
        } catch (err: unknown) {
            setHasPermission(false);
            setIsAnalyzing(false);

            if (err instanceof Error) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setPermissionError(
                        'Camera access denied. Please allow camera access in your browser settings and refresh the page.',
                    );
                } else if (err.name === 'NotFoundError') {
                    setPermissionError(
                        'No camera found on this device.',
                    );
                } else if (err.name === 'NotReadableError') {
                    setPermissionError(
                        'Camera is in use by another application. Please close it and try again.',
                    );
                } else {
                    setPermissionError(`Camera error: ${err.message}`);
                }
            }
        }
    }, [facing, stopStream, analyzeFrame]);

    // ── Flip between front and back camera ───────────────────────
    const flipCamera = useCallback(() => {
        setFacing((prev) => (prev === 'user' ? 'environment' : 'user'));
        setCapturedImage(null);
    }, []);

    // ── Capture current frame ─────────────────────────────────────
    const capture = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Mirror front camera capture so image isn't reversed
        if (facing === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedImage(dataUrl);

        // Convert data URL to File for API upload
        canvas.toBlob(
            (blob) => {
                if (!blob) return;
                const file = new File([blob], `capture-${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                });
                onCapture?.(dataUrl, file);
            },
            'image/jpeg',
            0.92,
        );

        // Stop quality analysis while showing capture
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, [facing, onCapture]);

    // ── Retake — clear capture and resume analysis ────────────────
    const retake = useCallback(() => {
        setCapturedImage(null);

        if (isReady && !intervalRef.current) {
            intervalRef.current = setInterval(() => {
                const result = analyzeFrame();
                setQuality(result);
            }, ANALYSIS_INTERVAL);
        }
    }, [isReady, analyzeFrame]);

    // ── Re-start camera when facing changes ──────────────────────
    useEffect(() => {
        startCamera();
        return () => stopStream();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facing]);

    // ── Cleanup on unmount ────────────────────────────────────────
    useEffect(() => {
        return () => stopStream();
    }, [stopStream]);

    return {
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
        stopCamera: stopStream,
        flipCamera,
        capture,
        retake,
    };
}
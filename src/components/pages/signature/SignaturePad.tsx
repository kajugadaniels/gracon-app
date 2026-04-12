'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Point = {
    x: number;
    y: number;
};

interface SignaturePadProps {
    disabled?: boolean;
    saving?: boolean;
    onSave: (file: File) => Promise<void> | void;
}

const CANVAS_HEIGHT = 188;
const EXPORT_PADDING = 18;
const MIN_POINT_DISTANCE = 0.8;

function strokePath(context: CanvasRenderingContext2D, points: Point[]) {
    if (points.length === 0) return;

    context.beginPath();

    if (points.length === 1) {
        const [point] = points;
        context.arc(point.x, point.y, 1.6, 0, Math.PI * 2);
        context.fill();
        return;
    }

    context.moveTo(points[0].x, points[0].y);

    for (let index = 1; index < points.length - 1; index += 1) {
        const current = points[index];
        const next = points[index + 1];
        const midpointX = (current.x + next.x) / 2;
        const midpointY = (current.y + next.y) / 2;
        context.quadraticCurveTo(current.x, current.y, midpointX, midpointY);
    }

    const lastPoint = points[points.length - 1];
    context.lineTo(lastPoint.x, lastPoint.y);
    context.stroke();
}

export function SignaturePad({
    disabled = false,
    saving = false,
    onSave,
}: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const strokesRef = useRef<Point[][]>([]);
    const activeStrokeRef = useRef<Point[] | null>(null);
    const activePointerIdRef = useRef<number | null>(null);
    const [strokeCount, setStrokeCount] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const configureContext = useCallback((context: CanvasRenderingContext2D) => {
        const pixelRatio = window.devicePixelRatio || 1;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 2.6;
        context.strokeStyle = '#5B23FF';
        context.fillStyle = '#5B23FF';
    }, []);

    const redraw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const pixelRatio = window.devicePixelRatio || 1;
        const width = canvas.width / pixelRatio;
        const height = canvas.height / pixelRatio;

        configureContext(context);
        context.clearRect(0, 0, width, height);

        context.save();
        context.strokeStyle = 'rgba(91,35,255,0.18)';
        context.lineWidth = 1;
        context.setLineDash([6, 8]);
        context.beginPath();
        context.moveTo(22, height - 40);
        context.lineTo(width - 22, height - 40);
        context.stroke();
        context.restore();

        configureContext(context);
        strokesRef.current.forEach((stroke) => {
            strokePath(context, stroke);
        });

        if (activeStrokeRef.current) {
            strokePath(context, activeStrokeRef.current);
        }
    }, [configureContext]);

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const parent = canvas.parentElement;
        const width = parent?.clientWidth ?? 560;
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(width * pixelRatio);
        canvas.height = Math.floor(CANVAS_HEIGHT * pixelRatio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${CANVAS_HEIGHT}px`;

        redraw();
    }, [redraw]);

    useEffect(() => {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [resizeCanvas]);

    const getPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>): Point | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const bounds = canvas.getBoundingClientRect();
        return {
            x: Math.min(Math.max(event.clientX - bounds.left, 0), bounds.width),
            y: Math.min(Math.max(event.clientY - bounds.top, 0), bounds.height),
        };
    }, []);

    const finishStroke = useCallback(() => {
        const stroke = activeStrokeRef.current;

        setIsDrawing(false);

        if (!stroke || stroke.length === 0) {
            activeStrokeRef.current = null;
            activePointerIdRef.current = null;
            redraw();
            return;
        }

        strokesRef.current = [...strokesRef.current, stroke];
        activeStrokeRef.current = null;
        activePointerIdRef.current = null;
        setStrokeCount(strokesRef.current.length);
        redraw();
    }, [redraw]);

    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        if (disabled || saving) return;

        const canvas = canvasRef.current;
        const point = getPoint(event);
        if (!canvas || !point) return;

        activePointerIdRef.current = event.pointerId;
        activeStrokeRef.current = [point];
        canvas.setPointerCapture(event.pointerId);
        setExportError(null);
        setIsDrawing(true);
        redraw();
    }, [disabled, getPoint, redraw, saving]);

    const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        if (activePointerIdRef.current !== event.pointerId || !activeStrokeRef.current) {
            return;
        }

        const point = getPoint(event);
        if (!point) return;

        const activeStroke = activeStrokeRef.current;
        const lastPoint = activeStroke[activeStroke.length - 1];
        const distance = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);

        if (distance < MIN_POINT_DISTANCE) {
            return;
        }

        activeStroke.push(point);
        redraw();
    }, [getPoint, redraw]);

    const handlePointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        if (activePointerIdRef.current !== event.pointerId) return;

        const canvas = canvasRef.current;
        if (canvas?.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }

        finishStroke();
    }, [finishStroke]);

    const handlePointerCancel = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        if (activePointerIdRef.current !== event.pointerId) return;

        setIsDrawing(false);
        activeStrokeRef.current = null;
        activePointerIdRef.current = null;

        const canvas = canvasRef.current;
        if (canvas?.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }

        redraw();
    }, [redraw]);

    const handleUndo = useCallback(() => {
        if (disabled || saving || strokesRef.current.length === 0) return;

        strokesRef.current = strokesRef.current.slice(0, -1);
        setStrokeCount(strokesRef.current.length);
        setExportError(null);
        redraw();
    }, [disabled, redraw, saving]);

    const handleClear = useCallback(() => {
        if (disabled || saving) return;

        strokesRef.current = [];
        activeStrokeRef.current = null;
        activePointerIdRef.current = null;
        setStrokeCount(0);
        setIsDrawing(false);
        setExportError(null);
        redraw();
    }, [disabled, redraw, saving]);

    const buildFile = useCallback(async () => {
        const points = strokesRef.current.flat();
        if (points.length === 0) {
            return null;
        }

        const minX = Math.min(...points.map((point) => point.x));
        const minY = Math.min(...points.map((point) => point.y));
        const maxX = Math.max(...points.map((point) => point.x));
        const maxY = Math.max(...points.map((point) => point.y));

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = Math.max(1, Math.ceil(maxX - minX + EXPORT_PADDING * 2));
        exportCanvas.height = Math.max(1, Math.ceil(maxY - minY + EXPORT_PADDING * 2));

        const context = exportCanvas.getContext('2d');
        if (!context) return null;

        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.lineWidth = 2.6;
        context.strokeStyle = '#5B23FF';
        context.fillStyle = '#5B23FF';

        const translatedStrokes = strokesRef.current.map((stroke) =>
            stroke.map((point) => ({
                x: point.x - minX + EXPORT_PADDING,
                y: point.y - minY + EXPORT_PADDING,
            })),
        );

        translatedStrokes.forEach((stroke) => {
            strokePath(context, stroke);
        });

        const blob = await new Promise<Blob | null>((resolve) => {
            exportCanvas.toBlob((value) => resolve(value), 'image/png');
        });

        if (!blob) {
            return null;
        }

        return new File([blob], `signature-${Date.now()}.png`, {
            type: 'image/png',
        });
    }, []);

    const handleSave = useCallback(async () => {
        if (disabled || saving) return;

        const file = await buildFile();
        if (!file) {
            setExportError('Draw your signature before saving it.');
            return;
        }

        setExportError(null);
        await onSave(file);
    }, [buildFile, disabled, onSave, saving]);

    return (
        <div style={{ display: 'grid', gap: 14 }}>
            <div
                style={{
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    background:
                        'linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(246,244,255,0.9) 100%)',
                    padding: 14,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                }}
            >
                <div
                    style={{
                        position: 'relative',
                        borderRadius: 16,
                        overflow: 'hidden',
                        background:
                            'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(249,248,255,1) 100%)',
                        border: '1px solid rgba(91,35,255,0.12)',
                    }}
                >
                    {strokeCount === 0 && !isDrawing && (
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none',
                                color: 'var(--color-text-muted)',
                                textAlign: 'center',
                                gap: 6,
                            }}
                        >
                            <span style={{ fontSize: 24 }}>✍️</span>
                            <div>
                                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600 }}>
                                    Draw your signature here
                                </p>
                                <p style={{ margin: 0, fontSize: 12 }}>
                                    Use your mouse, trackpad, or touch screen
                                </p>
                            </div>
                        </div>
                    )}

                    <canvas
                        ref={canvasRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerCancel}
                        style={{
                            display: 'block',
                            width: '100%',
                            height: CANVAS_HEIGHT,
                            cursor: disabled || saving ? 'not-allowed' : 'crosshair',
                            touchAction: 'none',
                            opacity: disabled ? 0.6 : 1,
                        }}
                    />
                </div>
            </div>

            {exportError && (
                <div
                    style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-error-subtle)',
                        border: '1px solid var(--color-error-border)',
                        fontSize: 13,
                        color: 'var(--color-error)',
                    }}
                >
                    {exportError}
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontSize: 12,
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                    }}
                >
                    Save your handwritten signature as a transparent PNG for display on printed documents.
                </p>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                        onClick={handleUndo}
                        disabled={strokeCount === 0 || disabled || saving}
                        className="btn-ghost"
                        style={{ fontSize: 12 }}
                    >
                        Undo
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={strokeCount === 0 || disabled || saving}
                        className="btn-ghost"
                        style={{ fontSize: 12 }}
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => void handleSave()}
                        disabled={strokeCount === 0 || disabled || saving}
                        className="btn-primary"
                        style={{ fontSize: 12 }}
                    >
                        {saving ? 'Saving…' : 'Save Signature'}
                    </button>
                </div>
            </div>
        </div>
    );
}

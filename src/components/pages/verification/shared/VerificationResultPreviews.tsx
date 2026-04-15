/**
 * Shows the captured ID and selfie previews with result badges.
 */

import Image from 'next/image';
import type { CSSProperties } from 'react';

type VerificationResultPreviewsProps = {
    idCardPreview: string | null;
    selfiePreview: string | null;
    documentMatch: boolean;
    faceScore: number;
};

function ResultPreviewCard({
    preview,
    alt,
    label,
    borderColor,
    badgeColor,
    badgeLabel,
    imageStyle,
}: {
    preview: string;
    alt: string;
    label: string;
    borderColor: string;
    badgeColor: string;
    badgeLabel: string;
    imageStyle?: CSSProperties;
}) {
    return (
        <div
            style={{
                flex: 1,
                minWidth: 180,
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: `1px solid ${borderColor}`,
                background: 'var(--color-surface)',
            }}
        >
            <div style={{ position: 'relative', aspectRatio: '4 / 3' }}>
                <Image
                    src={preview}
                    alt={alt}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 45vw, 220px"
                    style={{ objectFit: 'cover', opacity: 0.92, ...imageStyle }}
                />
                <div
                    style={{
                        position: 'absolute',
                        inset: 'auto 12px 12px auto',
                        borderRadius: 999,
                        padding: '6px 10px',
                        fontSize: 11,
                        fontWeight: 700,
                        background: badgeColor,
                        color: '#fff',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.18)',
                    }}
                >
                    {badgeLabel}
                </div>
            </div>
            <div style={{ padding: 14 }}>
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'var(--color-text)',
                    }}
                >
                    {label}
                </div>
            </div>
        </div>
    );
}

/**
 * Displays the submitted ID card and selfie captures in the result screen.
 */
export function VerificationResultPreviews({
    idCardPreview,
    selfiePreview,
    documentMatch,
    faceScore,
}: VerificationResultPreviewsProps) {
    if (!idCardPreview || !selfiePreview) return null;

    return (
        <div
            style={{
                display: 'flex',
                gap: 14,
                flexWrap: 'wrap',
            }}
        >
            <ResultPreviewCard
                preview={idCardPreview}
                alt="Captured ID card"
                label="Captured ID card"
                borderColor={
                    documentMatch
                        ? 'var(--color-success-border)'
                        : 'var(--color-error-border)'
                }
                badgeColor={
                    documentMatch
                        ? 'var(--color-success)'
                        : 'var(--color-error)'
                }
                badgeLabel={documentMatch ? 'Document matched' : 'No match'}
            />

            <ResultPreviewCard
                preview={selfiePreview}
                alt="Captured selfie"
                label="Captured selfie"
                borderColor="var(--color-border)"
                badgeColor={
                    faceScore >= 75
                        ? 'var(--color-success)'
                        : 'var(--color-warning)'
                }
                badgeLabel={`Face ${Math.round(faceScore)}%`}
                imageStyle={{
                    objectPosition: 'center 26%',
                }}
            />
        </div>
    );
}

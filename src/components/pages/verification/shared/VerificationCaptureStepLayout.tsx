/**
 * Shared layout shell for the ID-card and selfie capture steps.
 */

import type { ReactNode } from 'react';

type VerificationCaptureStepLayoutProps = {
    title: string;
    description: string;
    captured: boolean;
    loading?: boolean;
    loadingText?: string;
    backLabel: string;
    continueLabel: string;
    disabledLabel: string;
    captureSlot: ReactNode;
    onBack: () => void;
    onContinue: () => void;
};

const headingStyle = {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: 8,
    letterSpacing: '-0.02em',
} as const;

const descriptionStyle = {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
} as const;

const secondaryButtonStyle = {
    flex: 1,
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    padding: '13px 16px',
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    background: 'var(--color-surface)',
    cursor: 'pointer',
} as const;

const primaryButtonStyle = (disabled: boolean) =>
    ({
        flex: 2,
        borderRadius: 14,
        border: 0,
        padding: '13px 16px',
        fontSize: 14,
        fontWeight: 700,
        color: '#fff',
        background: disabled
            ? 'var(--color-text-muted)'
            : 'var(--color-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        boxShadow: disabled
            ? 'none'
            : '0 18px 34px rgba(64, 102, 255, 0.22)',
    }) as const;

/**
 * Renders the shared step heading, capture slot, and action buttons.
 */
export function VerificationCaptureStepLayout({
    title,
    description,
    captured,
    loading = false,
    loadingText,
    backLabel,
    continueLabel,
    disabledLabel,
    captureSlot,
    onBack,
    onContinue,
}: VerificationCaptureStepLayoutProps) {
    const continueDisabled = !captured || loading;
    const continueText = loading && loadingText
        ? loadingText
        : captured
          ? continueLabel
          : disabledLabel;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
                <h1 style={headingStyle}>{title}</h1>
                <p style={descriptionStyle}>{description}</p>
            </div>

            {captureSlot}

            <div style={{ display: 'flex', gap: 12 }}>
                <button
                    type="button"
                    onClick={onBack}
                    style={secondaryButtonStyle}
                >
                    {backLabel}
                </button>
                <button
                    type="button"
                    disabled={continueDisabled}
                    onClick={onContinue}
                    style={primaryButtonStyle(continueDisabled)}
                >
                    {continueText}
                </button>
            </div>
        </div>
    );
}

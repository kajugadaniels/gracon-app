/**
 * Renders biometric scoring details for the verification result.
 */

import { ScoreRing } from './ScoreRing';

type VerificationBiometricSummaryProps = {
    compositeScore: number;
    faceScore: number;
    livenessScore: number;
    passed: boolean;
};

function ScoreBar({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-text-muted)',
                    }}
                >
                    {label}
                </span>
                <span
                    style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--color-text)',
                    }}
                >
                    {Math.round(value)}%
                </span>
            </div>
            <div
                style={{
                    height: 8,
                    borderRadius: 999,
                    background: 'var(--color-border)',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: `${Math.max(0, Math.min(100, value))}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: color,
                    }}
                />
            </div>
        </div>
    );
}

/**
 * Displays the biometric scoring summary returned by verification.
 */
export function VerificationBiometricSummary({
    compositeScore,
    faceScore,
    livenessScore,
    passed,
}: VerificationBiometricSummaryProps) {
    return (
        <div
            style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 18,
                display: 'flex',
                gap: 18,
                alignItems: 'center',
                flexWrap: 'wrap',
            }}
        >
            <ScoreRing score={compositeScore} passed={passed} size={100} />

            <div
                style={{
                    flex: 1,
                    minWidth: 220,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                }}
            >
                <ScoreBar
                    label="Face match"
                    value={faceScore}
                    color="var(--color-primary)"
                />
                <ScoreBar
                    label="Liveness"
                    value={livenessScore}
                    color="var(--color-success)"
                />
                <ScoreBar
                    label="Composite score"
                    value={compositeScore}
                    color={
                        passed
                            ? 'var(--color-success)'
                            : 'var(--color-warning)'
                    }
                />
            </div>
        </div>
    );
}

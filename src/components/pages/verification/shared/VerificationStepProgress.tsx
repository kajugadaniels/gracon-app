/**
 * Renders the static progress indicator for the verification flow steps.
 */

import type { VerifyStep } from './types';

type VerificationStepProgressProps = {
    current: VerifyStep;
};

const STEPS: Array<{ id: VerifyStep; label: string }> = [
    { id: 'nid', label: 'Identity' },
    { id: 'id-card', label: 'ID card' },
    { id: 'selfie', label: 'Selfie' },
    { id: 'result', label: 'Result' },
];

/**
 * Displays the current step and completed progress in the verification flow.
 */
export function VerificationStepProgress({
    current,
}: VerificationStepProgressProps) {
    const currentIndex = STEPS.findIndex((step) => step.id === current);

    return (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {STEPS.map((step, index) => {
                const complete = index < currentIndex;
                const active = index === currentIndex;

                return (
                    <div
                        key={step.id}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        <div
                            style={{
                                height: 4,
                                borderRadius: 999,
                                background: active || complete
                                    ? 'var(--color-primary)'
                                    : 'var(--color-border)',
                                transition: 'background 160ms ease',
                            }}
                        />
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: active ? 700 : 600,
                                color: active
                                    ? 'var(--color-text)'
                                    : 'var(--color-text-muted)',
                            }}
                        >
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/**
 * Main-app wrapper around the shared verification flow composer.
 * Renders a connected-circle step progress indicator above the glass card
 * so the card body focuses entirely on the active step content.
 */

import { Fragment } from 'react';
import { VerificationFlowContent } from './shared';
import { Card } from '@/components/ui';
import { VerificationCaptureStep } from './VerificationCaptureStep';
import { VerificationResultPanel } from './VerificationResultPanel';
import type { VerificationFlowConfig } from './verification-flow-config';
import type { VerificationFlowController } from './use-verification-flow';
import type { VerifyStep } from './shared/types';

type VerificationFlowProps = {
    config: VerificationFlowConfig;
    controller: VerificationFlowController;
    documentNumberError?: string;
    documentNumber: string;
    onDocumentNumberChange: (value: string) => void;
    onNidSubmit: () => void;
    onContinue: () => void;
    onDashboard: () => void;
};

const STEP_LIST: Array<{ id: VerifyStep; label: string; num: number }> = [
    { id: 'nid',      label: 'Identity', num: 1 },
    { id: 'id-card',  label: 'ID Card',  num: 2 },
    { id: 'selfie',   label: 'Selfie',   num: 3 },
    { id: 'result',   label: 'Result',   num: 4 },
];

/**
 * Horizontal connected-circles progress indicator.
 * Completed steps show a checkmark, active step has a soft glow ring,
 * future steps are muted. Connector lines fill with primary colour as
 * the user advances.
 */
function ConnectedStepProgress({ current }: { current: VerifyStep }) {
    const currentIndex = STEP_LIST.findIndex((s) => s.id === current);

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: 28,
                padding: '0 4px',
            }}
            role="list"
            aria-label="Verification progress"
        >
            {STEP_LIST.map((step, index) => {
                const completed = index < currentIndex;
                const active = index === currentIndex;

                return (
                    <Fragment key={step.id}>
                        {/* Step circle + label */}
                        <div
                            role="listitem"
                            aria-current={active ? 'step' : undefined}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 7,
                                flexShrink: 0,
                            }}
                        >
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: completed ? 15 : 13,
                                    fontWeight: 700,
                                    background: completed || active
                                        ? 'var(--color-primary)'
                                        : 'rgba(91,35,255,0.08)',
                                    color: completed || active
                                        ? '#fff'
                                        : 'var(--color-text-muted)',
                                    boxShadow: active
                                        ? '0 0 0 5px rgba(91,35,255,0.15)'
                                        : 'none',
                                    transition: 'background 220ms ease, box-shadow 220ms ease',
                                    willChange: 'background',
                                    userSelect: 'none',
                                }}
                            >
                                {completed ? '✓' : step.num}
                            </div>

                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: active ? 700 : 500,
                                    color: active
                                        ? 'var(--color-text-primary)'
                                        : completed
                                          ? 'var(--color-primary)'
                                          : 'var(--color-text-muted)',
                                    whiteSpace: 'nowrap',
                                    transition: 'color 220ms ease',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line between steps */}
                        {index < STEP_LIST.length - 1 && (
                            <div
                                aria-hidden="true"
                                style={{
                                    flex: 1,
                                    height: 2,
                                    marginTop: 17,
                                    background: index < currentIndex
                                        ? 'var(--color-primary)'
                                        : 'rgba(91,35,255,0.12)',
                                    borderRadius: 1,
                                    transition: 'background 220ms ease',
                                    minWidth: 8,
                                }}
                            />
                        )}
                    </Fragment>
                );
            })}
        </div>
    );
}

/**
 * Renders the full verification experience: connected step progress above a
 * glass card that contains only the active step form content.
 */
export function VerificationFlow({
    config,
    controller,
    documentNumberError,
    documentNumber,
    onDocumentNumberChange,
    onNidSubmit,
    onContinue,
    onDashboard,
}: VerificationFlowProps) {
    return (
        <div style={{ width: '100%', maxWidth: 560 }}>
            <ConnectedStepProgress current={controller.step} />

            <Card strength="strong" style={{ width: '100%' }}>
                <VerificationFlowContent
                    config={config}
                    controller={controller}
                    documentNumberError={documentNumberError}
                    documentNumber={documentNumber}
                    onDocumentNumberChange={onDocumentNumberChange}
                    onNidSubmit={onNidSubmit}
                    onContinue={onContinue}
                    onDashboard={onDashboard}
                    showInternalProgress={false}
                    renderCaptureStep={(captureProps) => (
                        <VerificationCaptureStep {...captureProps} />
                    )}
                    renderResultPanel={(resultProps) => (
                        <VerificationResultPanel
                            result={controller.result!}
                            idCardPreview={controller.idCardPreview}
                            selfiePreview={controller.selfiePreview}
                            {...resultProps}
                        />
                    )}
                />
            </Card>
        </div>
    );
}

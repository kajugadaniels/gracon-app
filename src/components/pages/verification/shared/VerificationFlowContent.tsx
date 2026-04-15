/**
 * Shared step-composition wrapper for the verification flow.
 */

import type { ReactNode } from 'react';
import {
    VerificationIdentityStep,
    VerificationStepProgress,
} from './index';
import type { VerificationFlowConfig } from './verification-flow-config';
import type { VerificationFlowController } from './use-verification-flow-controller';

type VerificationCaptureStepSharedProps = {
    mode: 'id-card' | 'selfie';
    title: string;
    description: string;
    captured: boolean;
    loading?: boolean;
    loadingText?: string;
    backLabel: string;
    continueLabel: string;
    disabledLabel: string;
    onCapture: (preview: string, file: File) => void;
    onRetake: () => void;
    onBack: () => void;
    onContinue: () => void;
};

type VerificationResultPanelSharedProps = {
    successActionLabel: string;
    retryActionLabel: string;
    dashboardActionLabel: string;
    lockedActionLabel: string;
    onContinue: () => void;
    onRetry: () => void;
    onDashboard: () => void;
};

type VerificationFlowContentProps = {
    config: VerificationFlowConfig;
    controller: VerificationFlowController;
    documentNumberError?: string;
    documentNumber: string;
    onDocumentNumberChange: (value: string) => void;
    onNidSubmit: () => void;
    onContinue: () => void;
    onDashboard: () => void;
    /**
     * When false, suppresses the internal VerificationStepProgress bar.
     * Use this when the parent renders its own step indicator outside the card.
     * Defaults to true.
     */
    showInternalProgress?: boolean;
    renderCaptureStep: (
        props: VerificationCaptureStepSharedProps,
    ) => ReactNode;
    renderResultPanel: (
        props: VerificationResultPanelSharedProps,
    ) => ReactNode;
};

/**
 * Renders the shared verification step transitions and delegates app-local UI
 * details to capture/result render props.
 */
export function VerificationFlowContent({
    config,
    controller,
    documentNumberError,
    documentNumber,
    onDocumentNumberChange,
    onNidSubmit,
    onContinue,
    onDashboard,
    showInternalProgress = true,
    renderCaptureStep,
    renderResultPanel,
}: VerificationFlowContentProps) {
    return (
        <div className="animate-fade-up">
            {showInternalProgress && (
                <VerificationStepProgress current={controller.step} />
            )}

            {controller.step === 'nid' && (
                <VerificationIdentityStep
                    title={config.identity.title}
                    description={config.identity.description}
                    error={documentNumberError}
                    value={documentNumber}
                    onChange={onDocumentNumberChange}
                    onSubmit={onNidSubmit}
                />
            )}

            {controller.step === 'id-card' &&
                renderCaptureStep({
                    mode: 'id-card',
                    title: config.idCard.title,
                    description: config.idCard.description,
                    captured: controller.idCaptured,
                    backLabel: config.idCard.backLabel,
                    continueLabel: config.idCard.continueLabel,
                    disabledLabel: config.idCard.disabledLabel,
                    onCapture: controller.captureIdCard,
                    onRetake: controller.retakeIdCard,
                    onBack: () => controller.setStep('nid'),
                    onContinue: () => controller.setStep('selfie'),
                })}

            {controller.step === 'selfie' &&
                renderCaptureStep({
                    mode: 'selfie',
                    title: config.selfie.title,
                    description: config.selfie.description,
                    captured: controller.selfieCaptured,
                    loading: controller.loading,
                    loadingText: config.selfie.loadingText,
                    backLabel: config.selfie.backLabel,
                    continueLabel: config.selfie.continueLabel,
                    disabledLabel: config.selfie.disabledLabel,
                    onCapture: controller.captureSelfie,
                    onRetake: controller.retakeSelfie,
                    onBack: () => controller.setStep('id-card'),
                    onContinue: controller.submitVerification,
                })}

            {controller.step === 'result' &&
                controller.result &&
                renderResultPanel({
                    successActionLabel: config.result.successActionLabel,
                    retryActionLabel: config.result.retryActionLabel,
                    dashboardActionLabel: config.result.dashboardActionLabel,
                    lockedActionLabel: config.result.lockedActionLabel,
                    onContinue,
                    onRetry: controller.resetForRetry,
                    onDashboard,
                })}
        </div>
    );
}

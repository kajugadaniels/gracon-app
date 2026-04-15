/**
 * Shared copy builder for the verification flow modes.
 */

import type {
    VerificationChallengeMode,
    VerificationResult,
} from './types';

export type VerificationFlowConfig = {
    challengeMode: VerificationChallengeMode;
    identity: {
        title: string;
        description: string;
    };
    idCard: {
        title: string;
        description: string;
        backLabel: string;
        continueLabel: string;
        disabledLabel: string;
    };
    selfie: {
        title: string;
        description: string;
        backLabel: string;
        continueLabel: string;
        disabledLabel: string;
        loadingText: string;
    };
    result: {
        successActionLabel: string;
        retryActionLabel: string;
        dashboardActionLabel: string;
        lockedActionLabel: string;
    };
    getSuccessDescription: (result: VerificationResult) => string;
};

type VerificationFlowConfigOptions = {
    dashboardActionLabel: string;
    standardSuccessActionLabel: string;
    standardLockedActionLabel: string;
    standardSuccessDescription: (result: VerificationResult) => string;
};

/**
 * Builds the shared verification copy while allowing app-specific destinations.
 */
export function createVerificationFlowConfig(
    challengeMode: VerificationChallengeMode,
    options: VerificationFlowConfigOptions,
): VerificationFlowConfig {
    const sharedCaptureCopy = {
        idCard: {
            title: 'Photograph your ID card',
            description:
                'Hold your physical ID card in front of the back camera. Align it within the dashed border and ensure all text is readable.',
            backLabel: 'Back',
            continueLabel: 'Continue to selfie',
            disabledLabel: 'Capture ID card first',
        },
        selfie: {
            title: 'Take a selfie',
            description:
                'Look directly at the front camera. Position your face within the oval guide. Remove glasses if possible for the best result.',
            backLabel: 'Back',
            continueLabel: 'Submit for verification',
            disabledLabel: 'Capture selfie first',
            loadingText: 'Verifying...',
        },
    };

    if (challengeMode === 'INVITATION') {
        return {
            challengeMode,
            identity: {
                title: 'Confirm your identity for this invitation',
                description:
                    'Enter your 16-digit National ID number to continue the secure invitation challenge. We will compare it against the one registered on your account.',
            },
            ...sharedCaptureCopy,
            result: {
                successActionLabel: 'Return to invitation',
                retryActionLabel: 'Try again',
                dashboardActionLabel: options.dashboardActionLabel,
                lockedActionLabel: options.standardLockedActionLabel,
            },
            getSuccessDescription: (result) =>
                `Score: ${Math.round(result.compositeScore)}% — invitation verification is complete.`,
        };
    }

    return {
        challengeMode,
        identity: {
            title: 'Confirm your ID number',
            description:
                'Enter your 16-digit National ID number to begin. We&apos;ll compare it against the one you registered with.',
        },
        ...sharedCaptureCopy,
        result: {
            successActionLabel: options.standardSuccessActionLabel,
            retryActionLabel: 'Try again',
            dashboardActionLabel: options.dashboardActionLabel,
            lockedActionLabel: options.standardLockedActionLabel,
        },
        getSuccessDescription: options.standardSuccessDescription,
    };
}

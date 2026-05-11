/**
 * Main-app destination labels layered on the shared verification flow copy.
 */

import {
    createVerificationFlowConfig as createSharedVerificationFlowConfig,
    type VerificationFlowConfig,
    type VerificationChallengeMode,
} from './shared';
import type { VerificationResult } from '@/api/verification/verification-contract';

export type { VerificationFlowConfig };

/**
 * Returns the verification UI configuration for a specific challenge mode.
 */
export function createVerificationFlowConfig(
    challengeMode: VerificationChallengeMode,
    destination: 'dashboard' | 'login' = 'dashboard',
): VerificationFlowConfig {
    const isLoginDestination = destination === 'login';

    return createSharedVerificationFlowConfig(challengeMode, {
        dashboardActionLabel: 'Dashboard',
        standardSuccessActionLabel: isLoginDestination
            ? 'Continue to login'
            : 'Continue to dashboard',
        standardLockedActionLabel: isLoginDestination
            ? 'Continue to login'
            : 'Return to dashboard',
        standardSuccessDescription: (result: VerificationResult) =>
            isLoginDestination
                ? `Score: ${Math.round(result.compositeScore)}% — you can now log in with full access.`
                : `Score: ${Math.round(result.compositeScore)}% — you can now access your dashboard.`,
    });
}

/**
 * Shared verification input validation and result-notice helpers.
 */

import type { VerificationLockoutState, VerificationResult } from './types';

export type VerificationResultNotice =
    | { kind: 'attempts'; message: string }
    | { kind: 'lockout'; message: string }
    | null;

type VerificationResultNoticeInput = Pick<
    VerificationResult,
    'passed' | 'attemptsRemaining' | 'lockout'
>;

type DateFormatter = (value: string) => string;

/**
 * Returns the shared validation error for the national-ID entry step.
 */
export function getVerificationDocumentNumberError(
    documentNumber: string,
): string | undefined {
    if (documentNumber.length === 16) {
        return undefined;
    }

    return 'National ID must be exactly 16 digits';
}

/**
 * Returns whether the national-ID entry satisfies the shared verification
 * length requirement.
 */
export function isVerificationDocumentNumberValid(
    documentNumber: string,
): boolean {
    return getVerificationDocumentNumberError(documentNumber) === undefined;
}

/**
 * Returns the shared notice shown below failed verification results for
 * remaining attempts or active lockout windows.
 */
export function getVerificationResultNotice(
    result: VerificationResultNoticeInput,
    formatDate: DateFormatter = formatVerificationRetryDate,
): VerificationResultNotice {
    if (result.passed) {
        return null;
    }

    if (result.lockout.attemptLimitEnabled === false) {
        return null;
    }

    if (result.attemptsRemaining > 0) {
        return {
            kind: 'attempts',
            message: `${result.attemptsRemaining} attempt${
                result.attemptsRemaining !== 1 ? 's' : ''
            } remaining today`,
        };
    }

    if (hasVerificationLockout(result.lockout)) {
        return {
            kind: 'lockout',
            message: `Verification is locked for the current window. You can try again after ${formatDate(
                result.lockout.retryAvailableAt,
            )}.`,
        };
    }

    return null;
}

function hasVerificationLockout(
    lockout: VerificationLockoutState,
): lockout is VerificationLockoutState & { retryAvailableAt: string } {
    return Boolean(lockout.retryAvailableAt);
}

function formatVerificationRetryDate(value: string): string {
    return new Date(value).toLocaleString();
}

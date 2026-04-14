/**
 * Verification transport contract for the main app.
 *
 * The contract is frozen against `api/auth/docs/verification-contract.md`.
 * This file exists outside page code so the verification UI can consume a
 * stable API shape without coupling to a specific screen component.
 */

export type VerificationChallengeMode = 'STANDARD' | 'INVITATION';

export interface VerificationLockoutState {
    maxAttempts: number;
    attemptWindowHours: number;
    retryAvailableAt: string | null;
    retryAfterSeconds: number | null;
}

export interface VerificationIdInfo {
    fullName: string;
    dateOfBirth: string;
    documentNumber: string;
}

export interface VerificationResult {
    success: boolean;
    passed: boolean;
    compositeScore: number;
    faceScore: number;
    livenessScore: number;
    documentMatch: boolean;
    message: string;
    failReason: string | null;
    attemptsUsed: number;
    attemptsRemaining: number;
    lockout: VerificationLockoutState;
    idInfo?: VerificationIdInfo;
    upgradedTokens?: {
        accessToken: string;
        refreshToken: string;
    };
    challengeMode?: VerificationChallengeMode;
}

export interface SubmitVerificationResponse {
    success: boolean;
    data: VerificationResult;
}

export interface VerificationStatusResponse {
    isIdVerified: boolean;
    attemptsUsed: number;
    attemptsRemaining: number;
    canAttempt: boolean;
    lastAttemptAt: string | null;
    lockout: VerificationLockoutState;
}

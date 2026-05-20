/**
 * Shared verification transport and UI contract used across Gracon apps.
 */

export type VerificationChallengeMode = 'STANDARD' | 'INVITATION';

export interface VerificationLockoutState {
    maxAttempts: number;
    attemptWindowHours: number;
    attemptLimitEnabled?: boolean;
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

export type VerifyStep = 'nid' | 'id-card' | 'selfie' | 'result';

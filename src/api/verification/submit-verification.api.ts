import { apiClient } from '@/api/client';

export type VerificationChallengeMode = 'STANDARD' | 'INVITATION';

export interface VerificationLockoutState {
    maxAttempts: number;
    attemptWindowHours: number;
    retryAvailableAt: string | null;
    retryAfterSeconds: number | null;
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
    idInfo?: {
        fullName: string;
        dateOfBirth: string; // ISO string
        documentNumber: string;
    };
    // Present when passed=true — upgraded full tokens
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

export const submitVerificationApi = (
    documentNumber: string,
    idCard: File,
    selfie: File,
    challengeMode?: 'INVITATION',
) => {
    const form = new FormData();
    form.append('documentNumber', documentNumber);
    form.append('idCard', idCard);
    form.append('selfie', selfie);
    if (challengeMode) {
        form.append('challengeMode', challengeMode);
    }

    return apiClient.post<SubmitVerificationResponse>(
        '/verification/submit',
        form,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60_000,
        },
    );
};

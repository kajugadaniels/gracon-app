import { apiClient } from '@/api/client';

export interface VerificationStatusResponse {
    isIdVerified: boolean;
    attemptsUsed: number;
    attemptsRemaining: number;
    canAttempt: boolean;
    lastAttemptAt: string | null;
}

// Returns the user's current ID verification status
// Called by verify-identity page to show correct UI state
export const getVerificationStatusApi = () =>
    apiClient.get<VerificationStatusResponse>('/verification/status');
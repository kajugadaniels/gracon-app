import { apiClient } from '@/api/client';

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
}

export interface SubmitVerificationResponse {
    success: boolean;
    data: VerificationResult;
}

// Submits ID card photo + selfie + NID confirmation for AI verification
// Uses FormData — multipart/form-data upload
// Timeout is 60s — Rekognition processing can take up to 30s
export const submitVerificationApi = (
    documentNumber: string,
    idCard: File,
    selfie: File,
) => {
    const form = new FormData();
    form.append('documentNumber', documentNumber);
    form.append('idCard', idCard);
    form.append('selfie', selfie);

    return apiClient.post<SubmitVerificationResponse>(
        '/verification/submit',
        form,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60_000,
        },
    );
};
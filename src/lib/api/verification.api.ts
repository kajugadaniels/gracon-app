import { apiClient } from './client';

// ── Verification API calls ────────────────────────────────────

export const verificationApi = {
    // Get current verification status
    getStatus: () =>
        apiClient.get('/verification/status'),

    // Submit ID card + selfie for verification
    // Uses FormData — multipart/form-data upload
    submit: (documentNumber: string, idCard: File, selfie: File) => {
        const form = new FormData();
        form.append('documentNumber', documentNumber);
        form.append('idCard', idCard);
        form.append('selfie', selfie);

        return apiClient.post('/verification/submit', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
            // Longer timeout — Rekognition can take up to 30s
            timeout: 60_000,
        });
    },
};
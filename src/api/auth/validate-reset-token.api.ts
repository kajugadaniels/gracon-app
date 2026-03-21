import { apiClient } from '@/api/client';

export interface ValidateResetTokenResponse {
    valid: boolean;
    message: string;
}

// Validates a reset token before showing the new password form
// Called on page load — prevents showing the form for expired links
export const validateResetTokenApi = (userId: string, token: string) =>
    apiClient.get<ValidateResetTokenResponse>(
        '/auth/password-reset/validate',
        { params: { userId, token } },
    );
import { apiClient } from '@/api/client';

export interface ResetPasswordPayload {
    userId: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

// Submits the new password with the reset token
// On success: all sessions revoked on the server
export const resetPasswordApi = (payload: ResetPasswordPayload) =>
    apiClient.post<ResetPasswordResponse>(
        '/auth/password-reset/reset',
        payload,
    );
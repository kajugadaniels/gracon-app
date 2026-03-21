import { apiClient } from '@/api/client';

export interface ForgotPasswordPayload {
    email: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

// Sends a password reset email — always returns 200 regardless of
// whether the email is registered (anti-enumeration)
export const forgotPasswordApi = (payload: ForgotPasswordPayload) =>
    apiClient.post<ForgotPasswordResponse>(
        '/auth/password-reset/request',
        payload,
    );
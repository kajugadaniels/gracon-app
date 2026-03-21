import { apiClient } from '@/api/client';

export interface ResendVerificationResponse {
    success: boolean;
    message: string;
}

// Resends the email verification link
// Response is always vague (anti-enumeration) — same message regardless
export const resendVerificationApi = (email: string) =>
    apiClient.post<ResendVerificationResponse>(
        '/users/resend-verification',
        { email },
    );
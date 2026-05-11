import { apiClient } from '@/api/client';

export interface ResendVerificationResponse {
    success: boolean;
    message: string;
}

export type ResendVerificationPayload =
    | { email: string; userId?: never }
    | { userId: string; email?: never };

// Resends the email verification link
// Response is always vague (anti-enumeration) — same message regardless
export const resendVerificationApi = (payload: ResendVerificationPayload) =>
    apiClient.post<ResendVerificationResponse>(
        '/users/resend-verification',
        payload,
    );

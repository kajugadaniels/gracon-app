import { apiClient } from '@/api/client';

export interface VerifyEmailResponse {
    success: boolean;
    message: string;
}

// Called when user clicks the link in their verification email
// userId and token come from URL query params
export const verifyEmailApi = (userId: string, token: string) =>
    apiClient.get<VerifyEmailResponse>('/users/verify-email', {
        params: { userId, token },
    });
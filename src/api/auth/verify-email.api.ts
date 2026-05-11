import { apiClient } from '@/api/client';

export interface VerifyEmailResponse {
    success: boolean;
    message: string;
    tokenType?: 'limited';
    data?: {
        accessToken: string;
        refreshToken: string;
        user: {
            userId: string;
            email: string;
            phoneNumber: string | null;
            imageUrl: string | null;
            surName: string;
            postNames: string;
            sex: string;
            identityType: 'NID' | 'FIN';
            fin: string | null;
            isIdVerified: boolean;
            idVerifiedAt: string | null;
            createdAt: string;
        };
    };
}

// Called when user clicks the link in their verification email
// userId and token come from URL query params
export const verifyEmailApi = (userId: string, token: string) =>
    apiClient.get<VerifyEmailResponse>('/users/verify-email', {
        params: { userId, token },
    });

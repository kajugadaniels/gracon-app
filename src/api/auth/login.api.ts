import { apiClient } from '@/api/client';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface UserProfile {
    userId: string;
    email: string;
    phoneNumber: string | null;
    imageUrl: string | null;
    surName: string;
    postNames: string;
    sex: string;
    isIdVerified: boolean;
    idVerifiedAt: string | null;
    createdAt: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    // "limited" = user must complete ID verification before accessing dashboard
    // "full"    = user is fully verified, can access everything
    tokenType: 'full' | 'limited';
    data: {
        accessToken: string;
        refreshToken: string;
        user: UserProfile;
    };
}

export const loginApi = (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/auth/login', payload);
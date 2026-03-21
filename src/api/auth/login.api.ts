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
    data: {
        accessToken: string;
        refreshToken: string;
        user: UserProfile;
    };
}

// Authenticates user — all 5 gates must pass on the backend
// Returns access token (15min) + refresh token (30 days) + safe user profile
export const loginApi = (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/auth/login', payload);
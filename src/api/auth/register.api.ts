import { apiClient } from '@/api/client';

export interface RegisterPayload {
    documentNumber: string;
    email: string;
    phoneNumber?: string;
    password: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    data: {
        userId: string;
        email: string;
        surName: string;
        postNames: string;
        platformId: string;
    };
}

// Registers a new user — NID is looked up server-side
// Returns platformId shown once to user at registration
export const registerApi = (payload: RegisterPayload) =>
    apiClient.post<RegisterResponse>('/users/register', payload);
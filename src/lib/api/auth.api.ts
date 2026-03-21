import { apiClient } from './client';

export interface RegisterPayload {
    documentNumber: string;
    email: string;
    phoneNumber?: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface CitizenLookupPayload {
    documentNumber: string;
}

// ── Auth API calls ────────────────────────────────────────────

export const authApi = {
    // Look up citizen data by NID — pre-fills registration form
    lookupCitizen: (payload: CitizenLookupPayload) =>
        apiClient.post('/citizen/lookup', payload),

    // Register new user
    register: (payload: RegisterPayload) =>
        apiClient.post('/users/register', payload),

    // Verify email using token from link
    verifyEmail: (userId: string, token: string) =>
        apiClient.get('/users/verify-email', { params: { userId, token } }),

    // Resend verification email
    resendVerification: (email: string) =>
        apiClient.post('/users/resend-verification', { email }),

    // Login — returns access + refresh tokens
    login: (payload: LoginPayload) =>
        apiClient.post('/auth/login', payload),

    // Refresh access token
    refresh: (refreshToken: string) =>
        apiClient.post('/auth/refresh', { refreshToken }),

    // Logout — revoke refresh token
    logout: (refreshToken: string) =>
        apiClient.post('/auth/logout', { refreshToken }),

    // Logout all devices
    logoutAll: () =>
        apiClient.post('/auth/logout-all'),
};
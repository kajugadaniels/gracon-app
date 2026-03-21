import { apiClient } from '@/api/client';

export interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

// Issues new token pair using a valid refresh token
// Old refresh token is revoked after this call (token rotation)
export const refreshApi = (refreshToken: string) =>
    apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken });
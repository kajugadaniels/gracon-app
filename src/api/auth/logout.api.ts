import { apiClient } from '@/api/client';

export interface LogoutResponse {
    success: boolean;
    message: string;
}

// Revokes the provided refresh token on the server
// Frontend must also clear in-memory tokens after calling this
export const logoutApi = (refreshToken: string) =>
    apiClient.post<LogoutResponse>('/auth/logout', { refreshToken });

// Revokes ALL refresh tokens for the user — logs out every device
export const logoutAllApi = () =>
    apiClient.post<LogoutResponse>('/auth/logout-all');
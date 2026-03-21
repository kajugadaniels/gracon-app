// Changes the authenticated user's password.
// Requires the current password for confirmation.
// On success, all active refresh tokens are revoked (forces re-login everywhere).

import { apiClient } from '@/api/client';

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
}

export const changePasswordApi = (payload: ChangePasswordPayload) =>
    apiClient.patch<ChangePasswordResponse>('/users/password', payload);

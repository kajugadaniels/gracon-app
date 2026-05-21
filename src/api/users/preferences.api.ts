/**
 * API helpers for user-owned cross-platform invitation preferences.
 */
import { apiClient } from '@/api/client';

export type UserInviteVerificationPreference =
    | 'NO_VERIFICATION'
    | 'EMAIL_OTP'
    | 'IDENTITY_VERIFICATION';

export interface UserPreferencesResponse {
    defaultDocumentInviteVerifications: UserInviteVerificationPreference[];
    defaultMeetingInviteVerifications: UserInviteVerificationPreference[];
}

export interface UpdateUserPreferencesPayload {
    defaultDocumentInviteVerifications?: UserInviteVerificationPreference[];
    defaultMeetingInviteVerifications?: UserInviteVerificationPreference[];
}

/**
 * Fetches the authenticated user's cross-platform invitation defaults.
 */
export const getUserPreferencesApi = () =>
    apiClient.get<UserPreferencesResponse>('/users/preferences');

/**
 * Updates one or both invitation default groups for the authenticated user.
 */
export const updateUserPreferencesApi = (payload: UpdateUserPreferencesPayload) =>
    apiClient.patch<UserPreferencesResponse>('/users/preferences', payload);

// Updates mutable profile fields for the authenticated user.
// Email change locks the account until the new address is verified.
// Returns the updated full profile on success.

import { apiClient } from '@/api/client';
import { UserProfileResponse } from './get-profile.api';

export interface UpdateProfilePayload {
    email?: string;
    phoneNumber?: string;
}

export const updateProfileApi = (payload: UpdateProfilePayload) =>
    apiClient.patch<UserProfileResponse>('/users/profile', payload);

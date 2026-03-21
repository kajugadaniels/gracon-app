// Fetches the full profile of the authenticated user.
// Includes citizen identity, decrypted platform ID, and a presigned S3 URL
// for the profile image (valid 1 hour). Never returns sensitive fields.

import { apiClient } from '@/api/client';

export interface UserProfileResponse {
    id: string;
    email: string;
    phoneNumber: string | null;
    isVerified: boolean;
    isActive: boolean;
    isIdVerified: boolean;
    idVerifiedAt: string | null;  // ISO 8601
    createdAt: string;            // ISO 8601
    updatedAt: string;            // ISO 8601
    platformId: string | null;    // decrypted — never the ciphertext
    profileImageUrl: string | null;       // presigned S3 URL, valid 1 hour
    profileImageExpiresAt: string | null; // ISO 8601 expiry of the presigned URL
    citizenIdentity: {
        surName: string;
        postNames: string;
        sex: string;
        dateOfBirth: string; // ISO 8601
        countryOfBirth: string;
    } | null;
}

export const getProfileApi = () =>
    apiClient.get<UserProfileResponse>('/users/profile');

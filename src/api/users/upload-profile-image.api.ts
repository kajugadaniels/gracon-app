// Uploads or replaces the authenticated user's profile image.
// Sends the file as multipart/form-data with the field key "image".
// The server deletes the old image from S3 before uploading the new one.
// Returns a presigned S3 URL (valid 1 hour) for immediate display.

import { apiClient } from '@/api/client';

export interface UploadProfileImageResponse {
    profileImageUrl: string;       // presigned S3 URL, valid 1 hour
    profileImageExpiresAt: string; // ISO 8601 expiry of the presigned URL
}

export const uploadProfileImageApi = (file: File) => {
    const form = new FormData();
    form.append('image', file);

    return apiClient.post<UploadProfileImageResponse>(
        '/users/profile/image',
        form,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
        },
    );
};

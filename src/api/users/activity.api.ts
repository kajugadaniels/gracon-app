/**
 * API helpers for the authenticated user's read-only activity feed.
 */
import { apiClient } from '@/api/client';

export type UserActivityCategory =
    | 'all'
    | 'authentication'
    | 'verification'
    | 'account'
    | 'security';

export type UserActivityOrder = 'newest' | 'oldest';

export type UserActivityTone = 'success' | 'warning' | 'danger' | 'neutral';

export interface UserActivityQuery {
    page?: number;
    pageSize?: number;
    category?: UserActivityCategory;
    order?: UserActivityOrder;
    search?: string;
}

export interface UserActivityItem {
    id: string;
    eventType: string;
    category: Exclude<UserActivityCategory, 'all'>;
    title: string;
    description: string;
    tone: UserActivityTone;
    createdAt: string;
    ipAddress: string | null;
}

export interface UserActivityResponse {
    items: UserActivityItem[];
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}

/**
 * Fetches the authenticated user's immutable activity feed.
 */
export const getUserActivityApi = (query: UserActivityQuery) =>
    apiClient.get<UserActivityResponse>('/users/activity', { params: query });

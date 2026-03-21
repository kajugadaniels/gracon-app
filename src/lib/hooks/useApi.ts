'use client';

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (message: string) => void;
}

interface UseApiReturn<T, P extends unknown[]> {
    execute: (...args: P) => Promise<T | null>;
    loading: boolean;
    error: string | null;
    clearError: () => void;
}

/**
 * Generic hook wrapping any async API call.
 * Handles loading state, error extraction, and callbacks.
 *
 * Usage:
 *   const { execute, loading, error } = useApi(loginApi, {
 *     onSuccess: (data) => router.push('/dashboard'),
 *   });
 *   await execute({ email, password });
 */
export function useApi<T, P extends unknown[]>(
    apiCall: (...args: P) => Promise<{ data: T }>,
    options: UseApiOptions<T> = {},
): UseApiReturn<T, P> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    const execute = useCallback(
        async (...args: P): Promise<T | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiCall(...args);
                const data = response.data;
                options.onSuccess?.(data);
                return data;
            } catch (err) {
                const message = extractErrorMessage(err);
                setError(message);
                options.onError?.(message);
                return null;
            } finally {
                setLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [apiCall],
    );

    return { execute, loading, error, clearError };
}

// ── Error extraction ──────────────────────────────────────────

function extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data;

        if (data?.message) {
            return Array.isArray(data.message) ? data.message[0] : data.message;
        }

        const status = error.response?.status;
        if (!status || error.code === 'ERR_NETWORK') {
            return 'Network error. Please check your connection.';
        }
        if (status === 429) return 'Too many attempts. Please wait before trying again.';
        if (status === 503) return 'Service temporarily unavailable. Please try again.';
        if (status === 408) return 'Request timed out. Please try again.';
    }

    return 'Something went wrong. Please try again.';
}
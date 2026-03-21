'use client';

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { toast } from '@/components/ui';

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (message: string) => void;
    // Set false to suppress the automatic error toast
    showErrorToast?: boolean;
    // Set false to suppress the automatic success toast
    successMessage?: string;
}

interface UseApiReturn<T, P extends unknown[]> {
    execute: (...args: P) => Promise<T | null>;
    loading: boolean;
    error: string | null;
    clearError: () => void;
}

export function useApi<T, P extends unknown[]>(
    apiCall: (...args: P) => Promise<{ data: T }>,
    options: UseApiOptions<T> = {},
): UseApiReturn<T, P> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    const {
        showErrorToast = true,
        successMessage,
    } = options;

    const execute = useCallback(
        async (...args: P): Promise<T | null> => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiCall(...args);
                const data = response.data;

                // Show success toast if message provided
                if (successMessage) {
                    toast.success(successMessage);
                }

                options.onSuccess?.(data);
                return data;
            } catch (err) {
                const message = extractErrorMessage(err);
                setError(message);

                // Show error toast unless suppressed
                if (showErrorToast) {
                    toast.error(message);
                }

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

function extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data;
        const status = error.response?.status;

        if (data?.message) {
            return Array.isArray(data.message) ? data.message[0] : data.message;
        }

        if (!status || error.code === 'ERR_NETWORK') {
            return 'Network error. Please check your connection.';
        }
        if (status === 429) return 'Too many attempts. Please wait before trying again.';
        if (status === 503) return 'Service temporarily unavailable. Please try again.';
        if (status === 408) return 'Request timed out. Please try again.';
        if (status === 413) return 'File too large. Maximum size is 5MB.';
    }

    return 'Something went wrong. Please try again.';
}
'use client';

/**
 * Main-app adapter around the shared verification flow controller.
 */

import { AxiosError } from 'axios';
import { toast } from '@/components/ui';
import {
    useVerificationFlowController,
    type VerificationChallengeMode,
    type VerificationFlowController,
    type VerificationResult,
} from './shared';
import {
    submitVerificationApi,
} from '@/api/verification/submit-verification.api';
import { useAuthStore } from '@/lib/store/auth.store';

/**
 * Provides the main-app verification controller with local auth-store updates.
 */
export function useVerificationFlow(options: {
    challengeMode: VerificationChallengeMode;
    getSuccessDescription: (result: VerificationResult) => string;
    returnToLoginAfterPass?: boolean;
}) {
    const { user, setUser, setTokens, clearAuth } = useAuthStore();

    async function returnVerifiedUserToLogin(result: VerificationResult) {
        const tokens = result.upgradedTokens;

        if (tokens) {
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'}/auth/logout`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${tokens.accessToken}`,
                    },
                    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
                    keepalive: true,
                },
            ).catch(() => undefined);
        }

        clearAuth();
        window.location.replace('/login');
    }

    return useVerificationFlowController({
        challengeMode: options.challengeMode,
        getSuccessDescription: options.getSuccessDescription,
        submitVerification: async ({
            documentNumber,
            idCardFile,
            selfieFile,
            challengeMode,
        }) => {
            const response = await submitVerificationApi(
                documentNumber,
                idCardFile,
                selfieFile,
                challengeMode === 'INVITATION' ? 'INVITATION' : undefined,
            );
            return response.data;
        },
        notifications: {
            onMissingPhotos: (description) => {
                toast.error('Missing photos', { description });
            },
            onSuccess: (description) => {
                toast.success('Identity verified!', { description });
            },
            onFailure: (description) => {
                toast.error('Verification failed', { description });
            },
            onError: (description) => {
                toast.error('Verification unavailable', { description });
            },
        },
        normalizeErrorMessage: (error, fallback) => {
            const axiosError = error as AxiosError<{
                message?: string | { message?: string };
                error?: string;
            }>;
            const payload = axiosError.response?.data?.message;
            if (typeof payload === 'string' && payload.trim()) {
                return payload;
            }
            if (
                payload &&
                typeof payload === 'object' &&
                typeof payload.message === 'string' &&
                payload.message.trim()
            ) {
                return payload.message;
            }
            const fallbackMessage = axiosError.response?.data?.error;
            return typeof fallbackMessage === 'string' &&
                fallbackMessage.trim()
                ? fallbackMessage
                : fallback;
        },
        onVerificationPassed: (result) => {
            if (options.returnToLoginAfterPass) {
                void returnVerifiedUserToLogin(result);
                return;
            }

            if (user) {
                setUser({ ...user, isIdVerified: true });
            }
            if (result.upgradedTokens) {
                setTokens(
                    result.upgradedTokens.accessToken,
                    result.upgradedTokens.refreshToken,
                );
            }
        },
    });
}

export type { VerificationFlowController };

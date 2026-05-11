import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from 'axios';
import {
    clearAuthAndRedirect,
    getStoredAccessToken,
    isIdentityVerificationError,
    redirectToIdentityVerification,
    refreshStoredSession,
    upgradeStoredSession,
} from '@/api/auth/session-recovery';

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

function createApiClient(): AxiosInstance {
    const client = axios.create({
        baseURL: BASE_URL,
        timeout: 30_000,
        headers: { 'Content-Type': 'application/json' },
    });

    // ── Request interceptor ───────────────────────────────────────
    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = getAccessToken();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error),
    );

    // ── Response interceptor ──────────────────────────────────────
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const original = error.config as AxiosRequestConfig & {
                _retry?: boolean;
                _identityRetry?: boolean;
            };

            if (
                isIdentityVerificationError(error) &&
                !original._identityRetry
            ) {
                original._identityRetry = true;

                const upgradedAccessToken = await upgradeStoredSession();

                if (upgradedAccessToken) {
                    original.headers = {
                        ...original.headers,
                        Authorization: `Bearer ${upgradedAccessToken}`,
                    };
                    return client(original);
                }

                redirectToIdentityVerification();
            }

            // Only attempt refresh on 401 — and only once per request
            if (error.response?.status === 401 && !original._retry) {
                original._retry = true;

                try {
                    const newAccessToken = await refreshStoredSession();

                    if (newAccessToken) {
                        original.headers = {
                            ...original.headers,
                            Authorization: `Bearer ${newAccessToken}`,
                        };
                        return client(original);
                    }
                } catch {
                    clearAuthAndRedirect();
                    return Promise.reject(error);
                }

                // Refresh returned null — clear and redirect
                clearAuthAndRedirect();
            }

            return Promise.reject(error);
        },
    );

    return client;
}

// ── Token helpers ─────────────────────────────────────────────

// Read access token — tries store first, falls back to sessionStorage
// The sessionStorage fallback handles the case where the interceptor
// fires before the React component tree has hydrated the Zustand store
function getAccessToken(): string | null {
    return getStoredAccessToken();
}

export const apiClient = createApiClient();

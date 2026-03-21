import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Base API URL — pulled from env at build time
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

// Creates the Axios instance used across the entire frontend
function createApiClient(): AxiosInstance {
    const client = axios.create({
        baseURL: BASE_URL,
        timeout: 30_000,
        headers: { 'Content-Type': 'application/json' },
    });

    // ── Request interceptor — attach JWT access token to every request
    client.interceptors.request.use((config) => {
        // Access token stored in memory (not localStorage — XSS protection)
        // Retrieved from the auth store
        const token = getAccessTokenFromStore();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // ── Response interceptor — handle 401s with silent token refresh
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const original = error.config as AxiosRequestConfig & { _retry?: boolean };

            // 401 = access token expired — try refreshing once
            if (error.response?.status === 401 && !original._retry) {
                original._retry = true;

                try {
                    const refreshed = await refreshAccessToken();
                    if (refreshed) {
                        // Retry the original request with new token
                        original.headers = {
                            ...original.headers,
                            Authorization: `Bearer ${refreshed}`,
                        };
                        return client(original);
                    }
                } catch {
                    // Refresh failed — clear auth and redirect to login
                    clearAuthAndRedirect();
                }
            }

            return Promise.reject(error);
        },
    );

    return client;
}

// ── Token management helpers ──────────────────────────────────
// These reference the Zustand auth store — imported lazily to
// avoid circular dependency issues

function getAccessTokenFromStore(): string | null {
    // Dynamic import from auth store — avoids circular deps
    try {
        const { useAuthStore } = require('@/lib/store/auth.store');
        return useAuthStore.getState().accessToken;
    } catch {
        return null;
    }
}

async function refreshAccessToken(): Promise<string | null> {
    try {
        const { useAuthStore } = require('@/lib/store/auth.store');
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) return null;

        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data ?? response.data;

        // Update store with new tokens
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        return accessToken;
    } catch {
        return null;
    }
}

function clearAuthAndRedirect(): void {
    try {
        const { useAuthStore } = require('@/lib/store/auth.store');
        useAuthStore.getState().clearAuth();
    } catch { }

    // Only redirect in browser
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}

// Singleton — one client instance for the whole app
export const apiClient = createApiClient();
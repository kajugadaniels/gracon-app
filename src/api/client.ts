import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Base URL from environment — set in .env.local
const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

// Creates and configures the single Axios instance used by all API files
function createApiClient(): AxiosInstance {
    const client = axios.create({
        baseURL: BASE_URL,
        timeout: 30_000,
        headers: { 'Content-Type': 'application/json' },
    });

    // ── Request interceptor ───────────────────────────────────────
    // Attaches JWT access token to every outgoing request
    client.interceptors.request.use((config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // ── Response interceptor ──────────────────────────────────────
    // On 401 — attempt silent token refresh once, then retry
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const original = error.config as AxiosRequestConfig & {
                _retry?: boolean;
            };

            if (error.response?.status === 401 && !original._retry) {
                original._retry = true;

                try {
                    const newAccessToken = await attemptTokenRefresh();
                    if (newAccessToken) {
                        original.headers = {
                            ...original.headers,
                            Authorization: `Bearer ${newAccessToken}`,
                        };
                        return client(original);
                    }
                } catch {
                    clearAuthAndRedirect();
                }
            }

            return Promise.reject(error);
        },
    );

    return client;
}

// ── Token helpers — lazy import avoids circular dependency ────

function getAccessToken(): string | null {
    try {
        const { useAuthStore } = require('@/lib/store/auth.store');
        return useAuthStore.getState().accessToken;
    } catch {
        return null;
    }
}

async function attemptTokenRefresh(): Promise<string | null> {
    try {
        const { useAuthStore } = require('@/lib/store/auth.store');
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) return null;

        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } =
            response.data?.data ?? response.data;

        useAuthStore.getState().setTokens(accessToken, newRefresh);
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

    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
}

// Export singleton instance — imported by every API file
export const apiClient = createApiClient();
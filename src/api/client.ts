import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from 'axios';

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
            };

            // Only attempt refresh on 401 — and only once per request
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
    // 1. Try Zustand store (in-memory — populated after hydration)
    try {
        const { useAuthStore } = require('@/lib/store/auth.store');
        const storeToken = useAuthStore.getState().accessToken;
        if (storeToken) return storeToken;
    } catch { }

    // 2. Fallback — read directly from sessionStorage
    // This handles the gap between page load and React hydration
    if (typeof window !== 'undefined') {
        try {
            return sessionStorage.getItem('av_at');
        } catch { }
    }

    return null;
}

async function attemptTokenRefresh(): Promise<string | null> {
    // Try to get refresh token from store, fallback to sessionStorage
    let refreshToken: string | null = null;

    try {
        const { useAuthStore } = require('@/lib/store/auth.store');
        refreshToken = useAuthStore.getState().refreshToken;
    } catch { }

    if (!refreshToken && typeof window !== 'undefined') {
        try {
            refreshToken = sessionStorage.getItem('av_rt');
        } catch { }
    }

    if (!refreshToken) return null;

    try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } =
            response.data?.data ?? response.data;

        // Update both store and sessionStorage
        try {
            const { useAuthStore } = require('@/lib/store/auth.store');
            useAuthStore.getState().setTokens(accessToken, newRefresh);
        } catch {
            // If store unavailable, at least update sessionStorage directly
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('av_at', accessToken);
                sessionStorage.setItem('av_rt', newRefresh);
            }
        }

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

    // Direct sessionStorage clear as backup
    if (typeof window !== 'undefined') {
        try {
            ['av_at', 'av_rt', 'av_user'].forEach((key) =>
                sessionStorage.removeItem(key),
            );
        } catch { }

        // Remove session cookie
        document.cookie =
            'session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        window.location.href = '/login';
    }
}

export const apiClient = createApiClient();
'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import {
    hasSessionHintCookie,
    shouldAllowReadableAuthTokenCookies,
} from '@/lib/auth/session-cookie-policy';

interface AuthProviderProps {
    children: React.ReactNode;
}

// Mounts at the root of the app tree.
// On first render, calls hydrate() to restore tokens from sessionStorage
// into the Zustand store before any child renders an API call.
// Without this, page refreshes clear the in-memory store and every
// authenticated request gets a 401.
export function AuthProvider({ children }: AuthProviderProps) {
    const {
        hydrate,
        isHydrated,
        accessToken,
        user,
        setTokens,
        setUser,
        setLoading,
        clearAuth,
    } = useAuthStore();
    const hydrated = useRef(false);
    const restoredFromCookies = useRef(false);

    useEffect(() => {
        // Only hydrate once — guard against double-invocation in React StrictMode
        if (!hydrated.current) {
            hydrated.current = true;
            hydrate();
        }
    }, [hydrate]);

    useEffect(() => {
        if (restoredFromCookies.current) return;
        if (!isHydrated) return;
        if (accessToken && user) return;
        if (!hasSessionHintCookie()) return;

        restoredFromCookies.current = true;
        setLoading(true);

        const restoreSession = async () => {
            try {
                const response = await fetch('/api/me', {
                    method: 'GET',
                    credentials: 'include',
                    cache: 'no-store',
                });

                if (!response.ok) {
                    clearAuth();
                    return;
                }

                const payload = await response.json();
                const restoredAccessToken = payload?.accessToken;
                const restoredRefreshToken = payload?.refreshToken;
                const restoredUser = payload?.user;

                if (!restoredAccessToken || !restoredUser) {
                    clearAuth();
                    return;
                }

                // Production keeps refresh credentials inside HttpOnly cookies.
                // Development can still hydrate the old JS-readable refresh-token
                // path while local cross-app auth is being used.
                setTokens(
                    restoredAccessToken,
                    shouldAllowReadableAuthTokenCookies() && restoredRefreshToken
                        ? restoredRefreshToken
                        : '',
                );
                setUser(restoredUser);
            } catch {
                clearAuth();
            } finally {
                setLoading(false);
            }
        };

        void restoreSession();
    }, [accessToken, clearAuth, isHydrated, setLoading, setTokens, setUser, user]);

    return <>{children}</>;
}

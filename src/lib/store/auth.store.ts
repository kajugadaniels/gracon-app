import { create } from 'zustand';
import {
    clearClientAuthCookies,
    writeReadableAuthTokenCookies,
} from '../auth/session-cookie-policy';

export interface UserProfile {
    userId: string;
    email: string;
    phoneNumber: string | null;
    imageUrl: string | null;
    surName: string;
    postNames: string;
    sex: string;
    isIdVerified: boolean;
    idVerifiedAt: string | null;
    createdAt: string;
}

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: UserProfile | null;
    isLoading: boolean;
    isHydrated: boolean; // true once we've read from storage

    // Actions
    setTokens: (accessToken: string, refreshToken: string) => void;
    setUser: (user: UserProfile) => void;
    setLoading: (loading: boolean) => void;
    clearAuth: () => void;
    isLoggedIn: () => boolean;
    hydrate: () => void; // call on app mount to restore tokens
}

// Storage keys
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'av_at',   // sessionStorage — cleared when tab closes
    REFRESH_TOKEN: 'av_rt',   // sessionStorage — cleared when tab closes
    USER: 'av_user', // sessionStorage
} as const;

// Safe storage helpers — guards against SSR where window is undefined
const storage = {
    get: (key: string): string | null => {
        if (typeof window === 'undefined') return null;
        try {
            return sessionStorage.getItem(key);
        } catch {
            return null;
        }
    },
    set: (key: string, value: string): void => {
        if (typeof window === 'undefined') return;
        try {
            sessionStorage.setItem(key, value);
        } catch { }
    },
    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            sessionStorage.removeItem(key);
        } catch { }
    },
    clear: (): void => {
        if (typeof window === 'undefined') return;
        try {
            Object.values(STORAGE_KEYS).forEach((key) => sessionStorage.removeItem(key));
        } catch { }
    },
};

function clearSessionCookies(): void {
    clearClientAuthCookies();
}

export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: null,
    refreshToken: null,
    user: null,
    isLoading: false,
    isHydrated: false,

    // Saves tokens to store AND sessionStorage
    setTokens: (accessToken, refreshToken) => {
        // Keep sessionStorage during the migration to server-owned sessions so
        // current API clients continue working. Production must not rely on
        // JavaScript-readable refresh-token cookies for cross-app auth.
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        writeReadableAuthTokenCookies(accessToken, refreshToken);

        set({ accessToken, refreshToken });
    },

    // Saves user to store AND sessionStorage
    setUser: (user) => {
        storage.set(STORAGE_KEYS.USER, JSON.stringify(user));
        set({ user });
    },

    setLoading: (isLoading) => set({ isLoading }),

    // Clears everything from store and storage
    clearAuth: () => {
        storage.clear();
        clearSessionCookies();

        set({ accessToken: null, refreshToken: null, user: null });
    },

    isLoggedIn: () => {
        const { accessToken, user } = get();
        return !!(accessToken && user);
    },

    // Reads tokens back from sessionStorage into the store
    // Called once on app mount — restores state after page refresh
    hydrate: () => {
        const accessToken = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);
        const userRaw = storage.get(STORAGE_KEYS.USER);

        let user: UserProfile | null = null;
        if (userRaw) {
            try {
                user = JSON.parse(userRaw);
            } catch { }
        }

        set({
            accessToken: accessToken ?? null,
            refreshToken: refreshToken ?? null,
            user,
            isHydrated: true,
        });
    },
}));

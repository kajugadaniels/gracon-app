import { create } from 'zustand';

// User profile shape — matches SafeUserProfile from the backend
interface UserProfile {
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
    // Tokens — stored in memory only (never localStorage — XSS safe)
    accessToken: string | null;
    refreshToken: string | null;
    user: UserProfile | null;
    isLoading: boolean;

    // Actions
    setTokens: (accessToken: string, refreshToken: string) => void;
    setUser: (user: UserProfile) => void;
    setLoading: (loading: boolean) => void;
    clearAuth: () => void;
    isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    // Initial state — not logged in
    accessToken: null,
    refreshToken: null,
    user: null,
    isLoading: false,

    setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

    setUser: (user) =>
        set({ user }),

    setLoading: (isLoading) =>
        set({ isLoading }),

    clearAuth: () =>
        set({ accessToken: null, refreshToken: null, user: null }),

    isLoggedIn: () => {
        const { accessToken, user } = get();
        return !!(accessToken && user);
    },
}));
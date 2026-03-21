'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';

interface AuthProviderProps {
    children: React.ReactNode;
}

// Mounts at the root of the app tree.
// On first render, calls hydrate() to restore tokens from sessionStorage
// into the Zustand store before any child renders an API call.
// Without this, page refreshes clear the in-memory store and every
// authenticated request gets a 401.
export function AuthProvider({ children }: AuthProviderProps) {
    const { hydrate, isHydrated } = useAuthStore();
    const hydrated = useRef(false);

    useEffect(() => {
        // Only hydrate once — guard against double-invocation in React StrictMode
        if (!hydrated.current) {
            hydrated.current = true;
            hydrate();
        }
    }, [hydrate]);

    // Render children immediately — hydration is synchronous from sessionStorage
    // so by the time any child component fires an API call the store is populated
    return <>{children}</>;
}
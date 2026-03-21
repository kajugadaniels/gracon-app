import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/login';

export const metadata: Metadata = {
    title: 'Sign In — ID Verify',
    description: 'Sign in to your verified account',
};

// Suspense wraps LoginForm because it uses useSearchParams()
// which requires a Suspense boundary in Next.js 16
export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from '@/components/pages/auth/login';

export const metadata: Metadata = {
    title: 'Login',
    description: 'Sign in to your verified account',
};

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}

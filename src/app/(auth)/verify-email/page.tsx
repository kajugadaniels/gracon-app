import { Suspense } from 'react';
import type { Metadata } from 'next';
import { VerifyEmailView } from '@/components/verify-email';

export const metadata: Metadata = {
    title: 'Verify Email — ID Verify',
    description: 'Confirm your email address to activate your account',
};

export default function VerifyEmailPage() {
    return (
        <Suspense>
            <VerifyEmailView />
        </Suspense>
    );
}
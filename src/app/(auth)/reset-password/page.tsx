import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/pages/auth/reset-password';

export const metadata: Metadata = {
    title: 'Reset Password — ID Verify',
    description: 'Set a new password for your account',
};

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}
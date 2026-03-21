import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/pages/auth/forgot-password';

export const metadata: Metadata = {
    title: 'Forgot Password — ID Verify',
    description: 'Reset your account password',
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
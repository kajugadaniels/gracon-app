import type { Metadata } from 'next';
import { VerificationForm } from '@/components/verify-identity';

export const metadata: Metadata = {
    title: 'Verify Identity — ID Verify',
    description: 'Complete your identity verification to access your account',
};

export default function VerifyIdentityPage() {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '40px 16px',
                minHeight: 'calc(100dvh - 64px)',
            }}
        >
            <VerificationForm />
        </div>
    );
}
'use client';

import { RouteRecoveryState } from '@/components/ui';

export default function AuthError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <RouteRecoveryState
            error={error}
            eyebrow="Authentication"
            title="We could not load this sign-in step"
            message="The authentication screen failed to load. Try again, or return to login to start a clean session."
            actions={[
                { label: 'Try again', onClick: reset, variant: 'primary' },
                { label: 'Go to login', href: '/login' },
            ]}
        />
    );
}

'use client';

import { RouteRecoveryState } from '@/components/ui';

export default function VerifyIdentityError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <RouteRecoveryState
            error={error}
            eyebrow="Identity verification"
            title="We could not start verification"
            message="The verification screen failed to load. Retry before restarting the sign-in flow."
            actions={[
                { label: 'Try again', onClick: reset, variant: 'primary' },
                { label: 'Go to login', href: '/login' },
            ]}
        />
    );
}

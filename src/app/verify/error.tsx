'use client';

import { RouteRecoveryState } from '@/components/ui';

export default function PublicVerifyError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <RouteRecoveryState
            error={error}
            eyebrow="Public verification"
            title="We could not load verification"
            message="The public signature verification page failed to render. Retry without changing your account state."
            actions={[
                { label: 'Try again', onClick: reset, variant: 'primary' },
                { label: 'Reload page', href: '/verify' },
            ]}
        />
    );
}

'use client';

import { RouteRecoveryState } from '@/components/ui';

export default function ProtectedError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <RouteRecoveryState
            error={error}
            eyebrow="Workspace"
            title="We could not load your workspace"
            message="A protected account surface failed to render. Retry the page, or return to the dashboard."
            minHeight="70dvh"
            actions={[
                { label: 'Try again', onClick: reset, variant: 'primary' },
                { label: 'Dashboard', href: '/dashboard' },
            ]}
        />
    );
}

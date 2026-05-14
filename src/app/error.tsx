'use client';

import { RouteRecoveryState } from '@/components/ui';

export default function RootError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <RouteRecoveryState
            error={error}
            eyebrow="Application"
            title="Something went wrong"
            message="The application could not finish rendering this page. Retry, or return to login if the session is stale."
            actions={[
                { label: 'Try again', onClick: reset, variant: 'primary' },
                { label: 'Go to login', href: '/login' },
            ]}
        />
    );
}

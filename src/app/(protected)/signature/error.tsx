'use client';

import { RouteRecoveryState } from '@/components/ui';

export default function SignatureError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <RouteRecoveryState
            error={error}
            eyebrow="Digital signature"
            title="We could not load signature setup"
            message="Your account is still protected. Retry the signature setup screen, or return to your profile."
            minHeight="520px"
            actions={[
                { label: 'Try again', onClick: reset, variant: 'primary' },
                { label: 'Back to profile', href: '/settings/profile' },
            ]}
        />
    );
}

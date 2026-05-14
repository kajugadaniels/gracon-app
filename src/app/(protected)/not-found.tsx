import { RouteRecoveryState } from '@/components/ui';

export default function ProtectedNotFound() {
    return (
        <RouteRecoveryState
            kind="not-found"
            eyebrow="Workspace"
            title="This workspace page does not exist"
            message="The protected page may have moved, or your account may not have access to it."
            minHeight="70dvh"
            actions={[
                { label: 'Go to dashboard', href: '/dashboard', variant: 'primary' },
            ]}
        />
    );
}

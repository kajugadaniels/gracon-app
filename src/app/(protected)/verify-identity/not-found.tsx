import { RouteRecoveryState } from '@/components/ui';

export default function VerifyIdentityNotFound() {
    return (
        <RouteRecoveryState
            kind="not-found"
            eyebrow="Identity verification"
            title="This verification step does not exist"
            message="Start from login or dashboard so we can route you to the correct verification step."
            actions={[
                { label: 'Go to login', href: '/login', variant: 'primary' },
                { label: 'Dashboard', href: '/dashboard' },
            ]}
        />
    );
}

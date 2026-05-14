import { RouteRecoveryState } from '@/components/ui';

export default function RootNotFound() {
    return (
        <RouteRecoveryState
            kind="not-found"
            eyebrow="Gracon 360"
            title="Page not found"
            message="The page you requested does not exist, or it may have moved."
            actions={[
                { label: 'Go to dashboard', href: '/dashboard', variant: 'primary' },
                { label: 'Go to login', href: '/login' },
            ]}
        />
    );
}

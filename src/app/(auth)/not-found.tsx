import { RouteRecoveryState } from '@/components/ui';

export default function AuthNotFound() {
    return (
        <RouteRecoveryState
            kind="not-found"
            eyebrow="Authentication"
            title="This authentication page does not exist"
            message="The sign-in or account recovery link may be outdated. Start again from the login page."
            actions={[
                { label: 'Go to login', href: '/login', variant: 'primary' },
            ]}
        />
    );
}

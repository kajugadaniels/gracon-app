import { RouteRecoveryState } from '@/components/ui';

export default function PublicVerifyNotFound() {
    return (
        <RouteRecoveryState
            kind="not-found"
            eyebrow="Public verification"
            title="This verification page does not exist"
            message="Use the public verification page to check whether a signed document is authentic."
            actions={[
                { label: 'Open verification', href: '/verify', variant: 'primary' },
            ]}
        />
    );
}

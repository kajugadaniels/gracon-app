import { RouteRecoveryState } from '@/components/ui';

export default function SignatureNotFound() {
    return (
        <RouteRecoveryState
            kind="not-found"
            eyebrow="Digital signature"
            title="This signature page does not exist"
            message="Use the Signature page to manage your current digital signature setup."
            minHeight="520px"
            actions={[
                { label: 'Open signature', href: '/signature', variant: 'primary' },
            ]}
        />
    );
}

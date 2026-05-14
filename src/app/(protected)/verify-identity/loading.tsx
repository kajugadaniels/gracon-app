import { AppLoadingState } from '@/components/ui';

export default function VerifyIdentityLoading() {
    return (
        <AppLoadingState
            variant="fullscreen"
            message="Preparing identity verification..."
            detail="Starting the secure verification workflow"
        />
    );
}

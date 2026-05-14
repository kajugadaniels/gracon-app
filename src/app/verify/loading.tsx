import { AppLoadingState } from '@/components/ui';

export default function PublicVerifyLoading() {
    return (
        <AppLoadingState
            variant="fullscreen"
            message="Loading verification..."
            detail="Preparing public signature verification"
        />
    );
}

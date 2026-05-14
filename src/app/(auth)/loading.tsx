import { AppLoadingState } from '@/components/ui';

export default function AuthLoading() {
    return (
        <AppLoadingState
            variant="fullscreen"
            message="Preparing secure access..."
            detail="Loading your authentication flow"
        />
    );
}

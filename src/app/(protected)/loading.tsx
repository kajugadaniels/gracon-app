import { AppLoadingState } from '@/components/ui';

export default function ProtectedLoading() {
    return (
        <AppLoadingState
            variant="fullscreen"
            message="Opening your workspace..."
            detail="Checking account, session, and verification state"
        />
    );
}

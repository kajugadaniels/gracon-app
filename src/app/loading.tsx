import { AppLoadingState } from '@/components/ui';

export default function RootLoading() {
    return (
        <AppLoadingState
            variant="fullscreen"
            message="Loading Gracon 360..."
            detail="Preparing the application"
        />
    );
}

import { AppLoadingState } from '@/components/ui';

export default function SignatureLoading() {
    return (
        <AppLoadingState
            message="Loading digital signature..."
            detail="Checking key-pair, certificate, and signature image state"
            minHeight="520px"
        />
    );
}

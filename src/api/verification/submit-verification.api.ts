import { apiClient } from '@/api/client';
import { createVerificationClient } from './verification-client';
export type {
    SubmitVerificationResponse,
    VerificationChallengeMode,
    VerificationLockoutState,
    VerificationResult,
    VerificationStatusResponse,
} from './verification-contract';

const verificationClient = createVerificationClient(apiClient);

export const submitVerificationApi = verificationClient.submitVerification;

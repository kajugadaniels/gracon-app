import { apiClient } from '@/api/client';
import { createVerificationClient } from './verification-client';
export type { VerificationStatusResponse } from './verification-contract';

const verificationClient = createVerificationClient(apiClient);

export const getVerificationStatusApi = verificationClient.getVerificationStatus;

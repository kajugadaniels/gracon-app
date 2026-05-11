import axios from 'axios';
import {
    getStoredAccessToken,
    isIdentityVerificationError,
    redirectToIdentityVerification,
    refreshStoredSession,
    upgradeStoredSession,
} from '@/api/auth/session-recovery';

// Dedicated client for api/signature (port 3002) — separate from api/auth (port 3000).
// Inherits the Authorization header from the main client's request interceptor
// by sharing the same token-reading logic.
const SIGNATURE_BASE =
    process.env.NEXT_PUBLIC_SIGNATURE_API_URL ?? 'http://localhost:3002/api/v1';

const signatureClient = axios.create({
    baseURL: SIGNATURE_BASE,
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
});

// Forward the Bearer token to api/signature using the same store/sessionStorage approach.
signatureClient.interceptors.request.use((config) => {
    const token = getStoredAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

signatureClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config ?? {};

        if (isIdentityVerificationError(error) && !original._identityRetry) {
            original._identityRetry = true;

            const upgradedAccessToken = await upgradeStoredSession();
            if (upgradedAccessToken) {
                original.headers = {
                    ...original.headers,
                    Authorization: `Bearer ${upgradedAccessToken}`,
                };
                return signatureClient(original);
            }

            redirectToIdentityVerification();
        }

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;

            const refreshedAccessToken = await refreshStoredSession();
            if (refreshedAccessToken) {
                original.headers = {
                    ...original.headers,
                    Authorization: `Bearer ${refreshedAccessToken}`,
                };
                return signatureClient(original);
            }
        }

        return Promise.reject(error);
    },
);

// ─── Signature Image ──────────────────────────────────────────────────────────

export interface SignatureImageResponse {
    id: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    expiresIn: number;
    createdAt: string;
}

export async function uploadSignatureImage(
    file: File,
): Promise<{ id: string; mimeType: string; sizeBytes: number; createdAt: string }> {
    const form = new FormData();
    form.append('file', file);
    const res = await signatureClient.post('/signature/image/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}

export async function getSignatureImage(): Promise<SignatureImageResponse> {
    const res = await signatureClient.get('/signature/image');
    return res.data;
}

export async function deleteSignatureImage(): Promise<{ message: string }> {
    const res = await signatureClient.delete('/signature/image');
    return res.data;
}

// ─── Key Pairs ────────────────────────────────────────────────────────────────

export type KeyAlgorithm = 'RSA_2048' | 'ED25519';

export interface KeyPairResponse {
    id: string;
    algorithm: KeyAlgorithm;
    publicKey: string;
    fingerprint: string;
    createdAt: string;
}

export async function generateKeyPair(
    algorithm: KeyAlgorithm,
): Promise<KeyPairResponse> {
    const res = await signatureClient.post('/signature/keys/generate', { algorithm });
    return res.data;
}

export async function getPublicKey(): Promise<KeyPairResponse> {
    const res = await signatureClient.get('/signature/keys/public');
    return res.data;
}

export async function rotateKeyPair(
    algorithm: KeyAlgorithm,
): Promise<KeyPairResponse> {
    const res = await signatureClient.post('/signature/keys/rotate', { algorithm });
    return res.data;
}

// ─── Certificates ─────────────────────────────────────────────────────────────

export interface CertificateResponse {
    id: string;
    serialNumber: string;
    subjectCN: string;
    notBefore: string;
    notAfter: string;
    certificatePem: string;
    isRevoked: boolean;
    isExpired: boolean;
    daysRemaining: number;
}

export type CertificateRequestStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED';

export interface CertificateRequestResponse {
    requestId: string;
    status: CertificateRequestStatus;
    requestedValidityYears: number;
    reviewReason: string | null;
    cancellationReason: string | null;
    reviewedByAdminId: string | null;
    reviewedAt: string | null;
    cancelledAt: string | null;
    issuedCertificateId: string | null;
    requestedAt: string;
    updatedAt: string;
    message?: string;
    keyPairRotated?: boolean;
}

export type CertificateAccessPolicyStatus = 'ALLOWED' | 'BANNED';

export interface CertificateAccessPolicyResponse {
    status: CertificateAccessPolicyStatus;
    isBanned: boolean;
    banReason: string | null;
    bannedAt: string | null;
    unbanReason: string | null;
    unbannedAt: string | null;
    updatedAt: string | null;
}

export interface CertificateStatusResponse {
    accessPolicy: CertificateAccessPolicyResponse;
    latestRequest: CertificateRequestResponse | null;
    currentCertificate: Omit<CertificateResponse, 'certificatePem' | 'isRevoked'> | null;
    latestRevocation: {
        certificateId: string;
        serialNumber: string;
        revokedAt: string | null;
        revokedReason: string | null;
    } | null;
}

export async function issueCertificate(
    validityYears = 2,
): Promise<CertificateRequestResponse> {
    const res = await signatureClient.post('/signature/certificates/issue', { validityYears });
    return res.data;
}

export async function getCurrentCertificate(): Promise<CertificateResponse> {
    const res = await signatureClient.get('/signature/certificates/current');
    return res.data;
}

export async function getCurrentCertificateRequest(): Promise<CertificateRequestResponse> {
    const res = await signatureClient.get('/signature/certificates/request/current');
    return res.data;
}

export async function getCurrentCertificateStatus(): Promise<CertificateStatusResponse> {
    const res = await signatureClient.get('/signature/certificates/status');
    return res.data;
}

export async function revokeCertificate(
    reason: string,
): Promise<{ message: string; serialNumber: string; revokedAt: string }> {
    const res = await signatureClient.post('/signature/certificates/revoke', { reason });
    return res.data;
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export interface VerifyRequest {
    documentHash: string;
    signatureBytes: string;
    userId: string;
}

export interface VerifyResponse {
    valid: boolean;
    signer?: {
        subjectCN: string;
        certificateId: string;
        notBefore: string;
        notAfter: string;
    };
    reason?: string;
}

export async function verifySignature(
    payload: VerifyRequest,
): Promise<VerifyResponse> {
    // Public endpoint — no auth token needed
    // Uses the signature service base URL directly
    const base =
        process.env.NEXT_PUBLIC_SIGNATURE_API_URL ??
        'http://localhost:3002/api/v1';
    const res = await fetch(`${base}/signature/signing/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? 'Verification failed');
    }
    return res.json();
}

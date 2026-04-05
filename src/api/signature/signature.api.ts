import { apiClient } from '@/api/client';

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
    const res = await apiClient.post('/signature/image/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}

export async function getSignatureImage(): Promise<SignatureImageResponse> {
    const res = await apiClient.get('/signature/image');
    return res.data;
}

export async function deleteSignatureImage(): Promise<{ message: string }> {
    const res = await apiClient.delete('/signature/image');
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
    const res = await apiClient.post('/signature/keys/generate', { algorithm });
    return res.data;
}

export async function getPublicKey(): Promise<KeyPairResponse> {
    const res = await apiClient.get('/signature/keys/public');
    return res.data;
}

export async function rotateKeyPair(
    algorithm: KeyAlgorithm,
): Promise<KeyPairResponse> {
    const res = await apiClient.post('/signature/keys/rotate', { algorithm });
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

export async function issueCertificate(
    validityYears = 2,
): Promise<CertificateResponse> {
    const res = await apiClient.post('/signature/certificates/issue', { validityYears });
    return res.data;
}

export async function getCurrentCertificate(): Promise<CertificateResponse> {
    const res = await apiClient.get('/signature/certificates/current');
    return res.data;
}

export async function revokeCertificate(
    reason: string,
): Promise<{ message: string; serialNumber: string; revokedAt: string }> {
    const res = await apiClient.post('/signature/certificates/revoke', { reason });
    return res.data;
}

// ─── Signing ──────────────────────────────────────────────────────────────────

export interface SignResponse {
    signatureId: string;
    signatureBytes: string;
    certificateId: string;
    documentHash: string;
    documentName: string;
    signedAt: string;
}

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

export interface SignedDocumentRecord {
    id: string;
    documentName: string;
    documentHash: string;
    certificateId: string;
    signedAt: string;
}

export interface SigningHistoryResponse {
    total: number;
    page: number;
    limit: number;
    items: SignedDocumentRecord[];
}

export async function signDocument(
    documentHash: string,
    documentName: string,
): Promise<SignResponse> {
    const res = await apiClient.post('/signature/signing/sign', {
        documentHash,
        documentName,
    });
    return res.data;
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

export async function getSigningHistory(
    page = 1,
    limit = 20,
): Promise<SigningHistoryResponse> {
    const res = await apiClient.get('/signature/signing/history', {
        params: { page, limit },
    });
    return res.data;
}
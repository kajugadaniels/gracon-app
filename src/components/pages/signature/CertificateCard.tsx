'use client';

import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import type {
    CertificateRequestStatus,
    CertificateRequestResponse,
    CertificateResponse,
} from '@/api/signature/signature.api';
import {
    issueCertificate,
    revokeCertificate,
} from '@/api/signature/signature.api';

interface CertificateCardProps {
    certificate: CertificateResponse | null;
    certificateRequest: CertificateRequestResponse | null;
    hasKeyPair: boolean;
    onRefresh: () => void;
}

type CardState =
    | 'ACTIVE'
    | 'APPROVED'
    | 'REVOKED'
    | 'EXPIRED'
    | 'PENDING'
    | 'REJECTED'
    | 'CANCELLED'
    | 'EMPTY';

function PemBlock({ label, pem }: { label: string; pem: string }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    function copy() {
        navigator.clipboard.writeText(pem);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div style={{ marginBottom: 16 }}>
            <button
                onClick={() => setOpen((value) => !value)}
                style={toggleButtonStyle(open)}
            >
                <span style={toggleChevronStyle(open)}>▶</span>
                {open ? `Hide ${label}` : `View ${label}`}
            </button>

            {open && (
                <div className="animate-fade-in" style={pemShellStyle}>
                    <div style={pemHeaderStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {['rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)', 'rgba(16,185,129,0.7)'].map((color) => (
                                <div key={color} style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />
                            ))}
                            <span style={pemLabelStyle}>{label}</span>
                        </div>
                        <button onClick={copy} style={copyButtonStyle(copied)}>
                            {copied ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                    <pre style={pemContentStyle}>{pem}</pre>
                </div>
            )}
        </div>
    );
}

function ValidityBar({
    notBefore,
    notAfter,
    daysRemaining,
}: {
    notBefore: string;
    notAfter: string;
    daysRemaining: number;
}) {
    const totalDays = Math.ceil(
        (new Date(notAfter).getTime() - new Date(notBefore).getTime()) / 86_400_000,
    );
    const pct = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));
    const color = daysRemaining < 30
        ? 'var(--color-error)'
        : daysRemaining < 90
            ? 'var(--color-warning)'
            : 'var(--color-success)';

    return (
        <div style={{ marginBottom: 18 }}>
            <div style={validityHeaderStyle}>
                <span style={validityLabelStyle}>Certificate validity</span>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>
                    {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                </span>
            </div>
            <div style={validityTrackStyle}>
                <div style={{ ...validityFillStyle, width: `${pct}%`, background: color }} />
            </div>
            <div style={validityDatesStyle}>
                <span>{formatShortDate(notBefore)}</span>
                <span>{formatShortDate(notAfter)}</span>
            </div>
        </div>
    );
}

function RevokeConfirm({
    reason,
    onChange,
    onConfirm,
    onCancel,
    loading,
}: {
    reason: string;
    onChange: (value: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    return (
        <div style={dangerPanelStyle}>
            <p style={dangerTextStyle}>
                Revoking is permanent. Existing signatures remain valid, but no new ones can be created until you re-issue.
            </p>
            <textarea
                value={reason}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Reason for revocation (min 10 characters)…"
                rows={3}
                className="input-glass"
                style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={onCancel} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
                <button onClick={onConfirm} disabled={loading} style={dangerButtonStyle(loading)}>
                    {loading ? 'Revoking…' : 'Confirm Revoke'}
                </button>
            </div>
        </div>
    );
}

function determineCardState(
    certificate: CertificateResponse | null,
    request: CertificateRequestResponse | null,
): CardState {
    if (certificate && !certificate.isRevoked && !certificate.isExpired) {
        return 'ACTIVE';
    }

    if (request?.status === 'PENDING') {
        return 'PENDING';
    }

    if (request?.status === 'APPROVED') {
        return 'APPROVED';
    }

    if (request?.status === 'REJECTED') {
        return 'REJECTED';
    }

    if (request?.status === 'CANCELLED') {
        return 'CANCELLED';
    }

    if (certificate?.isRevoked) {
        return 'REVOKED';
    }

    if (certificate?.isExpired) {
        return 'EXPIRED';
    }

    return 'EMPTY';
}

function getStatusMeta(state: CardState) {
    switch (state) {
        case 'ACTIVE':
            return { label: 'Active', color: 'var(--color-success)' };
        case 'PENDING':
            return { label: 'Pending Approval', color: 'var(--color-warning)' };
        case 'APPROVED':
            return { label: 'Approved', color: 'var(--color-primary)' };
        case 'REJECTED':
            return { label: 'Rejected', color: 'var(--color-error)' };
        case 'CANCELLED':
            return { label: 'Cancelled', color: 'var(--color-text-muted)' };
        case 'REVOKED':
            return { label: 'Revoked', color: 'var(--color-error)' };
        case 'EXPIRED':
            return { label: 'Expired', color: 'var(--color-warning)' };
        default:
            return { label: 'Step 2', color: 'var(--color-primary)' };
    }
}

function CertificateFieldList({ certificate }: { certificate: CertificateResponse }) {
    const fields = [
        { label: 'Subject (CN)', value: certificate.subjectCN },
        { label: 'Serial Number', value: `${certificate.serialNumber.slice(0, 24)}…`, mono: true },
        { label: 'Valid From', value: formatShortDate(certificate.notBefore) },
        { label: 'Expires', value: formatShortDate(certificate.notAfter) },
    ];

    return (
        <div style={fieldListShellStyle}>
            {fields.map((field, index) => (
                <div key={field.label} style={fieldRowStyle(index, fields.length)}>
                    <span style={fieldLabelStyle}>{field.label}</span>
                    <span style={fieldValueStyle(field.mono)}>{field.value}</span>
                </div>
            ))}
        </div>
    );
}

function RequestStatusPanel({
    request,
}: {
    request: CertificateRequestResponse;
}) {
    const title = request.status === 'PENDING'
        ? 'Awaiting administrator approval'
        : request.status === 'APPROVED'
            ? 'Approved, certificate activation in progress'
        : request.status === 'REJECTED'
            ? 'Request rejected'
            : 'Request cancelled';

    const body = request.status === 'PENDING'
        ? 'Your request has been recorded. You cannot sign documents until an administrator approves and issues the real certificate.'
        : request.status === 'APPROVED'
            ? 'An administrator approved your request. If your active certificate is not visible yet, refresh this page to sync the issued certificate.'
        : request.status === 'REJECTED'
            ? 'An administrator reviewed your request and rejected it. Review the note below before sending a fresh request.'
            : 'This request is no longer active. If you still need a certificate, submit a fresh request with your current key pair.';

    return (
        <div style={infoPanelStyle(request.status)}>
            <p style={infoTitleStyle(request.status)}>{title}</p>
            <p style={infoBodyStyle}>{body}</p>
            <div style={requestMetaGridStyle}>
                <RequestMeta label="Requested" value={formatLongDate(request.requestedAt)} />
                <RequestMeta label="Validity" value={`${request.requestedValidityYears} year${request.requestedValidityYears > 1 ? 's' : ''}`} />
                <RequestMeta label="Status" value={request.status.toLowerCase()} />
                <RequestMeta label="Updated" value={formatLongDate(request.updatedAt)} />
            </div>
            {request.reviewedAt && (
                <div style={requestMetaRowStyle}>
                    <RequestMeta label="Reviewed At" value={formatLongDate(request.reviewedAt)} />
                    <RequestMeta
                        label="Issued Certificate"
                        value={request.issuedCertificateId ?? 'Pending sync'}
                    />
                </div>
            )}
            {request.reviewReason && (
                <div style={reasonPanelStyle}>
                    <span style={reasonLabelStyle}>Admin note</span>
                    <p style={reasonTextStyle}>{request.reviewReason}</p>
                </div>
            )}
            {request.cancellationReason && (
                <div style={reasonPanelStyle}>
                    <span style={reasonLabelStyle}>Cancellation reason</span>
                    <p style={reasonTextStyle}>{request.cancellationReason}</p>
                </div>
            )}
        </div>
    );
}

function RequestMeta({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={requestMetaLabelStyle}>{label}</span>
            <span style={requestMetaValueStyle}>{value}</span>
        </div>
    );
}

function EmptyCertificateState({
    hasKeyPair,
    loading,
    onIssue,
}: {
    hasKeyPair: boolean;
    loading: boolean;
    onIssue: () => void;
}) {
    if (!hasKeyPair) {
        return (
            <div style={emptyShellStyle}>
                <div style={emptyIconStyle('rgba(91,35,255,0.06)', 'rgba(91,35,255,0.20)')}>
                    <ShieldIcon stroke="var(--color-text-muted)" />
                </div>
                <p style={emptyPrimaryTextStyle}>
                    Complete Step 1 first — a key pair is required before a certificate request can be submitted.
                </p>
            </div>
        );
    }

    return (
        <div style={emptyShellStyle}>
            <div style={emptyIconStyle('var(--color-primary-subtle)', 'var(--color-border-primary)')}>
                <CertificateIcon stroke="var(--color-primary)" />
            </div>
            <p style={{ ...emptyPrimaryTextStyle, marginBottom: 6 }}>No certificate request yet</p>
            <p style={emptySecondaryTextStyle}>
                Your X.509 certificate binds your verified identity to your public key. Submit a request, then wait for admin approval before signing.
            </p>
            <button onClick={onIssue} disabled={loading} className="btn-primary" style={{ width: '100%' }}>
                {loading ? 'Submitting Request…' : 'Request Certificate Approval'}
            </button>
        </div>
    );
}

function CertificateIcon({ stroke }: { stroke: string }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
    );
}

function ShieldIcon({ stroke }: { stroke: string }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    );
}

function formatShortDate(value: string) {
    return new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatLongDate(value: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function CertificateCard({
    certificate,
    certificateRequest,
    hasKeyPair,
    onRefresh,
}: CertificateCardProps) {
    const [loading, setLoading] = useState(false);
    const [showRevoke, setShowRevoke] = useState(false);
    const [revokeReason, setRevokeReason] = useState('');
    const [error, setError] = useState<string | null>(null);

    const state = useMemo(
        () => determineCardState(certificate, certificateRequest),
        [certificate, certificateRequest],
    );
    const statusMeta = getStatusMeta(state);
    const isActive = state === 'ACTIVE';

    async function handleIssue() {
        setLoading(true);
        setError(null);
        try {
            await issueCertificate(2);
            await onRefresh();
        } catch (nextError: unknown) {
            setError(nextError instanceof Error ? nextError.message : 'Failed to submit certificate request');
        } finally {
            setLoading(false);
        }
    }

    async function handleRevoke() {
        if (revokeReason.trim().length < 10) {
            setError('Reason must be at least 10 characters.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await revokeCertificate(revokeReason.trim());
            setShowRevoke(false);
            setRevokeReason('');
            await onRefresh();
        } catch (nextError: unknown) {
            setError(nextError instanceof Error ? nextError.message : 'Failed to revoke certificate');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="glass-strong" style={{ borderRadius: 'var(--radius-xl)', padding: 28 }}>
            <div style={cardHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={headerIconShellStyle(isActive)}>
                        <CertificateIcon stroke={isActive ? 'var(--color-success)' : 'var(--color-primary)'} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <h3 style={cardTitleStyle}>Digital Certificate</h3>
                        </div>
                        <p style={cardSubtitleStyle}>
                            X.509 · Trusted by Gracon · Admin approval required before signing
                        </p>
                    </div>
                </div>
                <span style={statusBadgeStyle(statusMeta.color)}>
                    {statusMeta.label}
                </span>
            </div>

            {error && (
                <div style={errorBannerStyle}>
                    {error}
                </div>
            )}

            {isActive && certificate && (
                <>
                    <ValidityBar
                        notBefore={certificate.notBefore}
                        notAfter={certificate.notAfter}
                        daysRemaining={certificate.daysRemaining}
                    />
                    <CertificateFieldList certificate={certificate} />
                    <PemBlock label="Certificate (PEM)" pem={certificate.certificatePem} />
                    {!showRevoke ? (
                        <button onClick={() => setShowRevoke(true)} style={revokeTriggerStyle}>
                            Revoke Certificate
                        </button>
                    ) : (
                        <RevokeConfirm
                            reason={revokeReason}
                            onChange={setRevokeReason}
                            onConfirm={handleRevoke}
                            onCancel={() => {
                                setShowRevoke(false);
                                setRevokeReason('');
                            }}
                            loading={loading}
                        />
                    )}
                </>
            )}

            {!isActive && certificateRequest && (
                <>
                    <RequestStatusPanel request={certificateRequest} />
                    {certificateRequest.status === 'APPROVED' && (
                        <button onClick={onRefresh} className="btn-ghost" style={{ width: '100%' }}>
                            Refresh Certificate Status
                        </button>
                    )}
                    {certificateRequest.status !== 'PENDING' && certificateRequest.status !== 'APPROVED' && (
                        <button onClick={handleIssue} disabled={loading || !hasKeyPair} className="btn-primary" style={{ width: '100%' }}>
                            {loading ? 'Submitting Request…' : 'Submit Fresh Certificate Request'}
                        </button>
                    )}
                </>
            )}

            {!isActive && !certificateRequest && (
                <EmptyCertificateState
                    hasKeyPair={hasKeyPair}
                    loading={loading}
                    onIssue={handleIssue}
                />
            )}
        </div>
    );
}

const cardHeaderStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 22,
} satisfies CSSProperties;

function headerIconShellStyle(isActive: boolean): CSSProperties {
    return {
        width: 46,
        height: 46,
        borderRadius: 14,
        flexShrink: 0,
        background: isActive
            ? 'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(5,150,105,0.06))'
            : 'linear-gradient(135deg, var(--color-primary-subtle), rgba(91,35,255,0.04))',
        border: `1.5px solid ${isActive ? 'var(--color-success-border)' : 'var(--color-border-primary)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isActive
            ? '0 4px 14px rgba(5,150,105,0.12)'
            : '0 4px 14px rgba(91,35,255,0.08)',
    };
}

const cardTitleStyle = {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.01em',
} satisfies CSSProperties;

const cardSubtitleStyle = {
    margin: 0,
    fontSize: 12,
    color: 'var(--color-text-muted)',
    lineHeight: 1.4,
} satisfies CSSProperties;

function statusBadgeStyle(color: string): CSSProperties {
    return {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.07em',
        color,
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
        borderRadius: 20,
        padding: '3px 10px',
        flexShrink: 0,
        textTransform: 'uppercase',
    };
}

const errorBannerStyle = {
    marginBottom: 18,
    padding: '11px 14px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-error-subtle)',
    border: '1px solid var(--color-error-border)',
    fontSize: 13,
    color: 'var(--color-error)',
    lineHeight: 1.5,
} satisfies CSSProperties;

function toggleButtonStyle(open: boolean): CSSProperties {
    return {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontSize: 12,
        fontWeight: 600,
        color: open ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        transition: 'color 150ms ease',
    };
}

function toggleChevronStyle(open: boolean): CSSProperties {
    return {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 16,
        height: 16,
        borderRadius: 4,
        background: open ? 'var(--color-primary-subtle)' : 'rgba(91,35,255,0.06)',
        border: '1px solid var(--color-border)',
        fontSize: 9,
        fontWeight: 800,
        transition: 'transform 150ms ease, background 150ms ease',
        transform: open ? 'rotate(90deg)' : 'none',
    };
}

const pemShellStyle = {
    marginTop: 10,
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
    boxShadow: '0 2px 8px rgba(91,35,255,0.06)',
} satisfies CSSProperties;

const pemHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 12px',
    background: 'rgba(91,35,255,0.05)',
    borderBottom: '1px solid var(--color-border)',
} satisfies CSSProperties;

const pemLabelStyle = {
    fontSize: 10.5,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    marginLeft: 4,
} satisfies CSSProperties;

function copyButtonStyle(copied: boolean): CSSProperties {
    return {
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 10.5,
        fontWeight: 600,
        background: copied ? 'var(--color-success-subtle)' : 'rgba(255,255,255,0.8)',
        border: `1px solid ${copied ? 'var(--color-success-border)' : 'var(--color-border)'}`,
        color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)',
        cursor: 'pointer',
        transition: 'all 150ms ease',
    };
}

const pemContentStyle = {
    margin: 0,
    padding: '12px 14px',
    background: 'rgba(91,35,255,0.02)',
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    fontFamily: 'monospace',
    lineHeight: 1.75,
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    maxHeight: 180,
    overflowY: 'auto',
} satisfies CSSProperties;

const validityHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
} satisfies CSSProperties;

const validityLabelStyle = {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
} satisfies CSSProperties;

const validityTrackStyle = {
    height: 7,
    borderRadius: 4,
    background: 'rgba(91,35,255,0.08)',
    overflow: 'hidden',
} satisfies CSSProperties;

const validityFillStyle = {
    height: '100%',
    borderRadius: 4,
    transition: 'width 700ms ease',
} satisfies CSSProperties;

const validityDatesStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 5,
    fontSize: 10,
    color: 'var(--color-text-muted)',
} satisfies CSSProperties;

const fieldListShellStyle = {
    border: '1px solid rgba(91,35,255,0.10)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    marginBottom: 18,
} satisfies CSSProperties;

function fieldRowStyle(index: number, total: number): CSSProperties {
    return {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 14px',
        background: index % 2 === 0 ? 'rgba(91,35,255,0.025)' : 'transparent',
        borderBottom: index < total - 1 ? '1px solid rgba(91,35,255,0.07)' : 'none',
    };
}

const fieldLabelStyle = {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    fontWeight: 500,
} satisfies CSSProperties;

function fieldValueStyle(mono?: boolean): CSSProperties {
    return {
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        fontFamily: mono ? 'monospace' : undefined,
    };
}

const revokeTriggerStyle = {
    marginTop: 4,
    width: '100%',
    padding: '10px 0',
    borderRadius: 9999,
    background: 'var(--color-error-subtle)',
    border: '1px solid var(--color-error-border)',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--color-error)',
    cursor: 'pointer',
    transition: 'background 150ms ease',
} satisfies CSSProperties;

const dangerPanelStyle = {
    marginTop: 16,
    padding: '16px 18px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-error-subtle)',
    border: '1px solid var(--color-error-border)',
} satisfies CSSProperties;

const dangerTextStyle = {
    margin: '0 0 12px',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-error)',
    lineHeight: 1.55,
} satisfies CSSProperties;

function dangerButtonStyle(loading: boolean): CSSProperties {
    return {
        flex: 1,
        padding: '10px 0',
        borderRadius: 9999,
        background: 'var(--color-error)',
        color: '#fff',
        border: 'none',
        fontSize: 12,
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 150ms ease',
    };
}

function infoPanelStyle(status: CertificateRequestStatus): CSSProperties {
    const isPending = status === 'PENDING';
    const isRejected = status === 'REJECTED';
    return {
        marginBottom: 18,
        padding: '16px 18px',
        borderRadius: 'var(--radius-lg)',
        background: isPending
            ? 'rgba(245,158,11,0.08)'
            : isRejected
                ? 'var(--color-error-subtle)'
                : 'rgba(148,163,184,0.10)',
        border: isPending
            ? '1px solid rgba(245,158,11,0.24)'
            : isRejected
                ? '1px solid var(--color-error-border)'
                : '1px solid rgba(148,163,184,0.22)',
    };
}

function infoTitleStyle(status: CertificateRequestStatus): CSSProperties {
    return {
        margin: '0 0 6px',
        fontSize: 13,
        fontWeight: 700,
        color: status === 'PENDING'
            ? 'var(--color-warning)'
            : status === 'REJECTED'
                ? 'var(--color-error)'
                : 'var(--color-text-secondary)',
    };
}

const infoBodyStyle = {
    margin: '0 0 14px',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
} satisfies CSSProperties;

const requestMetaGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
} satisfies CSSProperties;

const requestMetaRowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
    marginTop: 12,
} satisfies CSSProperties;

const requestMetaLabelStyle = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
} satisfies CSSProperties;

const requestMetaValueStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
} satisfies CSSProperties;

const reasonPanelStyle = {
    marginTop: 14,
    paddingTop: 14,
    borderTop: '1px solid rgba(91,35,255,0.10)',
} satisfies CSSProperties;

const reasonLabelStyle = {
    display: 'inline-block',
    marginBottom: 6,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
} satisfies CSSProperties;

const reasonTextStyle = {
    margin: 0,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
} satisfies CSSProperties;

const emptyShellStyle = {
    textAlign: 'center',
    padding: '8px 0 4px',
} satisfies CSSProperties;

function emptyIconStyle(background: string, borderColor: string): CSSProperties {
    return {
        width: 56,
        height: 56,
        borderRadius: '50%',
        margin: '0 auto 16px',
        background,
        border: `1.5px dashed ${borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
}

const emptyPrimaryTextStyle = {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    margin: 0,
    lineHeight: 1.6,
} satisfies CSSProperties;

const emptySecondaryTextStyle = {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    margin: '0 auto 24px',
    lineHeight: 1.6,
    maxWidth: 360,
} satisfies CSSProperties;

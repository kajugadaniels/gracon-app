/**
 * Displays the structured identity details returned by the verification service.
 */

import type { VerificationIdInfo } from './types';

type VerificationIdentitySummaryProps = {
    idInfo: VerificationIdInfo;
    documentMatch: boolean;
};

function MatchBadge({ matched }: { matched: boolean }) {
    return (
        <span
            style={{
                borderRadius: 999,
                padding: '4px 10px',
                fontSize: 11,
                fontWeight: 700,
                color: matched ? 'var(--color-success)' : 'var(--color-error)',
                background: matched
                    ? 'var(--color-success-subtle)'
                    : 'var(--color-error-subtle)',
                border: `1px solid ${
                    matched
                        ? 'var(--color-success-border)'
                        : 'var(--color-error-border)'
                }`,
            }}
        >
            {matched ? 'Matched' : 'No match'}
        </span>
    );
}

/**
 * Shows verified name, date of birth, and masked document number.
 */
export function VerificationIdentitySummary({
    idInfo,
    documentMatch,
}: VerificationIdentitySummaryProps) {
    return (
        <div
            style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--color-text-muted)',
                            marginBottom: 6,
                        }}
                    >
                        Verified identity
                    </div>
                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: 'var(--color-text)',
                        }}
                    >
                        {idInfo.fullName}
                    </div>
                </div>

                <MatchBadge matched={documentMatch} />
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 16,
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--color-text-muted)',
                            marginBottom: 6,
                        }}
                    >
                        Date of birth
                    </div>
                    <div
                        style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'var(--color-text)',
                        }}
                    >
                        {idInfo.dateOfBirth}
                    </div>
                </div>

                <div>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: 'var(--color-text-muted)',
                            marginBottom: 6,
                        }}
                    >
                        Document number
                    </div>
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            flexWrap: 'wrap',
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'var(--color-text)',
                        }}
                    >
                        <span>
                            ••••&nbsp;••••&nbsp;••••&nbsp;
                            {idInfo.documentNumber.slice(12)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

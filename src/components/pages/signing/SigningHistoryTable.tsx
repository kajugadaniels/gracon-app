'use client';

// Paginated signing history — each row is expandable to reveal the full
// document hash and certificate ID with copy-to-clipboard buttons.

import { useCallback, useEffect, useState } from 'react';
import { getSigningHistory } from '@/api/signature/signature.api';
import type { SignedDocumentRecord } from '@/api/signature/signature.api';

export interface SigningHistoryTableProps {
    refreshTrigger: number;
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

/** Summary row showing total count and most recent signature date. */
function StatsBar({ total, items }: { total: number; items: SignedDocumentRecord[] }) {
    const latest = items[0]
        ? new Date(items[0].signedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        : null;

    return (
        <div
            style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
            }}
        >
            <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Signing History
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {total} document{total !== 1 ? 's' : ''} signed
                </p>
            </div>
            {latest && (
                <div
                    style={{
                        padding: '4px 12px', borderRadius: 9999,
                        background: 'var(--color-primary-subtle)',
                        border: '1px solid var(--color-border-primary)',
                        fontSize: 12, color: 'var(--color-text-secondary)',
                    }}
                >
                    Last: {latest}
                </div>
            )}
        </div>
    );
}

// ─── Expanded details ─────────────────────────────────────────────────────────

interface ExpandedDetailsProps {
    item: SignedDocumentRecord;
}

/** Full hash and cert ID shown when a history row is expanded. */
function ExpandedDetails({ item }: ExpandedDetailsProps) {
    const [copied, setCopied] = useState<string | null>(null);

    function copy(text: string, key: string) {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    }

    function CopyBtn({ text, id }: { text: string; id: string }) {
        return (
            <button
                onClick={(e) => { e.stopPropagation(); copy(text, id); }}
                style={{
                    flexShrink: 0, padding: '3px 8px',
                    background: copied === id ? 'var(--color-success-subtle)' : 'rgba(91,35,255,0.06)',
                    border: `1px solid ${copied === id ? 'var(--color-success-border)' : 'var(--color-border)'}`,
                    borderRadius: 6, fontSize: 10,
                    color: copied === id ? 'var(--color-success)' : 'var(--color-text-muted)',
                    cursor: 'pointer', transition: 'all 150ms ease', whiteSpace: 'nowrap',
                }}
            >
                {copied === id ? '✓' : 'Copy'}
            </button>
        );
    }

    const fieldStyle: React.CSSProperties = {
        fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text-secondary)',
        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    };

    const labelStyle: React.CSSProperties = {
        margin: '0 0 4px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: 'var(--color-text-muted)',
    };

    return (
        <div
            className="animate-fade-up"
            style={{
                padding: '12px 24px 16px',
                background: 'rgba(91,35,255,0.02)',
                borderTop: '1px solid var(--color-border)',
            }}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                    <p style={labelStyle}>Document Hash (SHA-256)</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <code style={fieldStyle}>{item.documentHash}</code>
                        <CopyBtn text={item.documentHash} id={`hash-${item.id}`} />
                    </div>
                </div>
                <div>
                    <p style={labelStyle}>Certificate ID</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <code style={fieldStyle}>{item.certificateId}</code>
                        <CopyBtn text={item.certificateId} id={`cert-${item.id}`} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── History row ──────────────────────────────────────────────────────────────

interface HistoryRowProps {
    item: SignedDocumentRecord;
    isLast: boolean;
}

/** Single signing record row. Click to expand hash + cert details. */
function HistoryRow({ item, isLast }: HistoryRowProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-border)' }}>
            <div
                onClick={() => setExpanded((e) => !e)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 24px', cursor: 'pointer',
                    background: expanded ? 'rgba(91,35,255,0.03)' : 'transparent',
                    transition: 'background 120ms ease',
                }}
                onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = 'rgba(91,35,255,0.02)'; }}
                onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = 'transparent'; }}
            >
                {/* Icon */}
                <div
                    style={{
                        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                        background: 'var(--color-primary-subtle)',
                        border: '1px solid var(--color-border-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}
                >
                    📄
                </div>

                {/* Name + hash preview */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                        style={{
                            margin: 0, fontSize: 14, fontWeight: 500,
                            color: 'var(--color-text-primary)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                    >
                        {item.documentName}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                        {item.documentHash.slice(0, 20)}…
                    </p>
                </div>

                {/* Date */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        {new Date(item.signedAt).toLocaleDateString()}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {new Date(item.signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                {/* Expand chevron */}
                <span
                    style={{
                        fontSize: 10, color: 'var(--color-text-muted)',
                        transition: 'transform 200ms ease',
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        marginLeft: 4,
                    }}
                >
                    ▼
                </span>
            </div>

            {expanded && <ExpandedDetails item={item} />}
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

/** Shown when the user has not yet signed any documents. */
function EmptyState() {
    return (
        <div style={{ padding: '52px 32px', textAlign: 'center' }}>
            <div
                style={{
                    width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
                    background: 'var(--color-primary-subtle)',
                    border: '1px solid var(--color-border-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}
            >
                📭
            </div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                No documents signed yet
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                Sign your first document above — it will appear here immediately
            </p>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
}

/** Previous / page indicator / next pagination row. */
function Pagination({ page, totalPages, onPrev, onNext }: PaginationProps) {
    const btnStyle = (disabled: boolean): React.CSSProperties => ({
        background: 'rgba(91,35,255,0.06)', border: '1px solid var(--color-border)',
        borderRadius: 8, padding: '6px 16px', fontSize: 13,
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        transition: 'all 120ms ease',
    });

    return (
        <div
            style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
                padding: '16px 24px', borderTop: '1px solid var(--color-border)',
            }}
        >
            <button onClick={onPrev} disabled={page === 1} style={btnStyle(page === 1)}>← Prev</button>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', minWidth: 80, textAlign: 'center' }}>
                Page {page} of {totalPages}
            </span>
            <button onClick={onNext} disabled={page === totalPages} style={btnStyle(page === totalPages)}>Next →</button>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Paginated table of past signed documents with expandable rows
 * that reveal the full SHA-256 hash and certificate ID.
 */
export function SigningHistoryTable({ refreshTrigger }: SigningHistoryTableProps) {
    const [items, setItems] = useState<SignedDocumentRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getSigningHistory(page, 10);
            setItems(res.items);
            setTotal(res.total);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { load(); }, [load, refreshTrigger]);

    const totalPages = Math.max(1, Math.ceil(total / 10));

    return (
        <div
            className="glass"
            style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}
        >
            <StatsBar total={total} items={items} />

            {loading ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                    Loading…
                </div>
            ) : items.length === 0 ? (
                <EmptyState />
            ) : (
                items.map((item, i) => (
                    <HistoryRow key={item.id} item={item} isLast={i === items.length - 1} />
                ))
            )}

            {totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPrev={() => setPage((p) => Math.max(1, p - 1))}
                    onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
            )}
        </div>
    );
}

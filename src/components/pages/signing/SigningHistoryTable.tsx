'use client';

import { useCallback, useEffect, useState } from 'react';
import { getSigningHistory } from '@/api/signature/signature.api';
import type { SignedDocumentRecord } from '@/api/signature/signature.api';

interface SigningHistoryTableProps {
    refreshTrigger: number;
}

export function SigningHistoryTable({ refreshTrigger }: SigningHistoryTableProps) {
    const [items, setItems] = useState<SignedDocumentRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState<string | null>(null);

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

    function copyHash(hash: string) {
        navigator.clipboard.writeText(hash);
        setCopied(hash);
        setTimeout(() => setCopied(null), 2000);
    }

    const totalPages = Math.max(1, Math.ceil(total / 10));

    return (
        <div
            style={{
                background: 'var(--glass-card)',
                backdropFilter: 'blur(var(--glass-card-blur))',
                border: '1px solid var(--glass-card-border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--glass-card-shadow)',
                overflow: 'hidden',
            }}
        >
            {/* Table header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--glass-card-border)',
                }}
            >
                <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                        Signing History
                    </h3>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                        {total} document{total !== 1 ? 's' : ''} signed
                    </p>
                </div>
            </div>

            {/* Rows */}
            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Loading…
                </div>
            ) : items.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center' }}>
                    <p style={{ fontSize: 32, margin: '0 0 12px' }}>📭</p>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
                        No documents signed yet
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
                        Sign your first document above to see it here
                    </p>
                </div>
            ) : (
                items.map((item, i) => (
                    <div
                        key={item.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            padding: '16px 24px',
                            borderBottom: i < items.length - 1 ? '1px solid var(--glass-card-border)' : 'none',
                            transition: 'background 150ms ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-interactive-hover)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                        <div
                            style={{
                                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                                background: 'var(--primary-glass)', border: '1px solid var(--primary-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                            }}
                        >
                            📄
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.documentName}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                {item.documentHash.slice(0, 16)}…
                            </p>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                                {new Date(item.signedAt).toLocaleDateString()}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                                {new Date(item.signedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        <button
                            onClick={() => copyHash(item.documentHash)}
                            style={{
                                flexShrink: 0,
                                background: copied === item.documentHash ? 'var(--success-glass)' : 'var(--glass-interactive)',
                                border: `1px solid ${copied === item.documentHash ? 'var(--success-border)' : 'var(--glass-interactive-border)'}`,
                                borderRadius: 6, padding: '5px 10px',
                                fontSize: 11, color: copied === item.documentHash ? 'var(--success-text)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                            }}
                        >
                            {copied === item.documentHash ? '✓ Copied' : 'Copy Hash'}
                        </button>
                    </div>
                ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div
                    style={{
                        display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center',
                        padding: '16px 24px', borderTop: '1px solid var(--glass-card-border)',
                    }}
                >
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                            background: 'var(--glass-interactive)', border: '1px solid var(--glass-interactive-border)',
                            borderRadius: 8, padding: '6px 14px', fontSize: 13,
                            color: page === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                            cursor: page === 1 ? 'not-allowed' : 'pointer',
                        }}
                    >
                        ← Prev
                    </button>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={{
                            background: 'var(--glass-interactive)', border: '1px solid var(--glass-interactive-border)',
                            borderRadius: 8, padding: '6px 14px', fontSize: 13,
                            color: page === totalPages ? 'var(--text-muted)' : 'var(--text-secondary)',
                            cursor: page === totalPages ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
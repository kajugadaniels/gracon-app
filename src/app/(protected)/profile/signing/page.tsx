'use client';

// Sign Documents page — full-width layout with header, sign panel, and history table.

import { useState } from 'react';
import { SignDocumentPanel, SigningHistoryTable } from '@/components/pages/signing';

export default function SigningPage() {
    // Incrementing forces SigningHistoryTable to re-fetch after a new signature
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div
            className="animate-fade-up"
            style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}
        >
            {/* ── Page header ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 36 }}>
                <div
                    style={{
                        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                        background: 'var(--color-primary-subtle)',
                        border: '1px solid var(--color-border-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                    }}
                >
                    ✍️
                </div>
                <div>
                    <h1
                        style={{
                            margin: '0 0 4px', fontSize: 26, fontWeight: 700,
                            color: 'var(--color-text-primary)', letterSpacing: '-0.02em',
                        }}
                    >
                        Sign Documents
                    </h1>
                    <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Apply your cryptographic signature to any document.
                        The file never leaves your device — only its SHA-256 hash is sent.
                    </p>
                </div>
            </div>

            {/* ── Content ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <SignDocumentPanel onSigned={() => setRefreshTrigger(v => v + 1)} />
                <SigningHistoryTable refreshTrigger={refreshTrigger} />
            </div>
        </div>
    );
}

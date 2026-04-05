'use client';

import { useState } from 'react';
import { SignDocumentPanel } from '@/components/pages/signing';
import { SigningHistoryTable } from '@/components/pages/signing';

export default function SigningPage() {
    // Incrementing this causes the history table to re-fetch
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Sign Documents
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Cryptographically sign any document. The file never leaves your device — only its SHA-256 hash is sent to the server.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <SignDocumentPanel onSigned={() => setRefreshTrigger(v => v + 1)} />
                <SigningHistoryTable refreshTrigger={refreshTrigger} />
            </div>
        </div>
    );
}
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';

interface PlatformIdCardProps {
    platformId: string;
}

// Displays the encrypted platform ID — hidden by default, reveal on click
export function PlatformIdCard({ platformId }: PlatformIdCardProps) {
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(platformId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Mask the ID — show only last 4 digits
    const masked = `••••••• ${platformId.slice(-4)}`;

    return (
        <Card
            className="animate-fade-up"
            style={{
                background: 'var(--color-primary-subtle)',
                border: '1px solid var(--color-border-primary)',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}
                    >
                        Platform ID
                    </span>

                    <button
                        onClick={() => setRevealed((r) => !r)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'var(--color-primary)',
                            padding: '2px 6px',
                            borderRadius: 6,
                            transition: 'background 150ms ease',
                        }}
                    >
                        {revealed ? 'Hide' : 'Reveal'}
                    </button>
                </div>

                {/* ID value */}
                <div
                    style={{
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: 18,
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        letterSpacing: '0.10em',
                        filter: revealed ? 'none' : 'blur(8px)',
                        transition: 'filter 280ms ease',
                        userSelect: revealed ? 'text' : 'none',
                    }}
                >
                    {platformId}
                </div>

                {/* Masked hint when hidden */}
                {!revealed && (
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {masked} — click Reveal to show
                    </span>
                )}

                {/* Copy button — only when revealed */}
                {revealed && (
                    <button
                        onClick={handleCopy}
                        className="animate-fade-in"
                        style={{
                            background: copied ? 'var(--color-success-subtle)' : 'rgba(91,35,255,0.08)',
                            border: `1px solid ${copied ? 'var(--color-success-border)' : 'var(--color-border)'}`,
                            borderRadius: 'var(--radius-sm)',
                            padding: '6px 14px',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 500,
                            color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)',
                            alignSelf: 'flex-start',
                            transition: 'all 180ms ease',
                        }}
                    >
                        {copied ? '✓ Copied' : 'Copy to clipboard'}
                    </button>
                )}
            </div>
        </Card>
    );
}

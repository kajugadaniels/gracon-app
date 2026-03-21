'use client';

import type { CitizenData } from '@/api/auth/citizen-lookup.api';

interface CitizenPreviewProps {
    data: CitizenData;
}

// Displays pre-filled citizen data retrieved from the national ID API
// Shows user what info was found before they complete registration
export function CitizenPreview({ data }: CitizenPreviewProps) {
    const fields: { label: string; value: string }[] = [
        { label: 'Surname', value: data.surName },
        { label: 'Given names', value: data.postNames },
        { label: 'Sex', value: data.sex },
        { label: 'Date of birth', value: data.dateOfBirth },
        { label: 'Country of birth', value: data.countryOfBirth },
    ];

    return (
        <div
            style={{
                background: 'var(--color-success-subtle)',
                border: '1px solid var(--color-success-border)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: 'var(--color-success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        color: '#fff',
                        fontWeight: 700,
                        flexShrink: 0,
                    }}
                >
                    ✓
                </span>
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-success)',
                    }}
                >
                    Identity found — please confirm your details
                </span>
            </div>

            {/* Fields grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 8,
                }}
            >
                {fields.map(({ label, value }) => (
                    <div key={label}>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 500,
                                color: 'var(--color-text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                marginBottom: 3,
                            }}
                        >
                            {label}
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: 'var(--color-text-primary)',
                            }}
                        >
                            {value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
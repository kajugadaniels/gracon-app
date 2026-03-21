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
            className="animate-scale-in"
            style={{
                background: 'var(--color-success-subtle)',
                border: '1px solid var(--color-success-border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                    style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: 'var(--color-success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
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
                className="stagger"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 8,
                }}
            >
                {fields.map(({ label, value }) => (
                    <div key={label} className="animate-fade-up">
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: 'var(--color-text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                marginBottom: 2,
                            }}
                        >
                            {label}
                        </div>
                        <div
                            style={{
                                fontSize: 13,
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

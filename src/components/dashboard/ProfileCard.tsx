'use client';

import { useAuthStore } from '@/lib/store/auth.store';
import { Card, StatusBadge } from '@/components/ui';

// Displays the user's profile information and verification status
export function ProfileCard() {
    const { user } = useAuthStore();
    if (!user) return null;

    const initials =
        `${user.postNames?.[0] ?? ''}${user.surName?.[0] ?? ''}`.toUpperCase();

    return (
        <Card
            strength="strong"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
            }}
        >
            {/* Avatar + name row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Avatar */}
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: 'var(--color-primary-subtle)',
                        border: '2px solid var(--color-border-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        flexShrink: 0,
                    }}
                >
                    {user.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt="Profile"
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        initials
                    )}
                </div>

                {/* Name + badge */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: 20,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: 4,
                            letterSpacing: '-0.01em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {user.postNames} {user.surName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <StatusBadge
                            status={user.isIdVerified ? 'verified' : 'pending'}
                            label={user.isIdVerified ? 'ID Verified' : 'Verification pending'}
                            pulse={user.isIdVerified}
                        />
                    </div>
                </div>
            </div>

            {/* Details grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 16,
                    paddingTop: 16,
                    borderTop: '1px solid var(--color-border)',
                }}
            >
                {[
                    { label: 'Email', value: user.email },
                    { label: 'Phone', value: user.phoneNumber ?? '—' },
                    { label: 'Sex', value: user.sex },
                    { label: 'Member since', value: new Date(user.createdAt).toLocaleDateString() },
                ].map(({ label, value }) => (
                    <div key={label}>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 500,
                                color: 'var(--color-text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                marginBottom: 4,
                            }}
                        >
                            {label}
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: 'var(--color-text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {value}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
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
            className="animate-fade-up"
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
        >
            {/* Avatar + name row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {/* Avatar */}
                <div
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'var(--color-primary-subtle)',
                        border: '2px solid var(--color-border-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
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
                            fontSize: 16,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: 5,
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
                className="stagger"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 14,
                    paddingTop: 14,
                    borderTop: '1px solid var(--color-border)',
                }}
            >
                {[
                    { label: 'Email',         value: user.email },
                    { label: 'Phone',         value: user.phoneNumber ?? '—' },
                    { label: 'Sex',           value: user.sex },
                    { label: 'Member since',  value: new Date(user.createdAt).toLocaleDateString() },
                ].map(({ label, value }) => (
                    <div key={label} className="animate-fade-up">
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
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
                                fontSize: 13,
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

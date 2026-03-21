'use client';

import { Card, StatusBadge } from '@/components/ui';
import { ProfileImageUpload } from '@/components/pages/dashboard/ProfileImageUpload';
import { UserProfileResponse } from '@/api/users/get-profile.api';

interface ProfileCardProps {
    profile: UserProfileResponse;
    onImageUpload: (url: string) => void;
}

export function ProfileCard({ profile, onImageUpload }: ProfileCardProps) {
    const ci = profile.citizenIdentity;
    const initials = `${ci?.postNames?.[0] ?? ''}${ci?.surName?.[0] ?? ''}`.toUpperCase();
    const fullName = ci ? `${ci.postNames} ${ci.surName}` : profile.email;

    const fields = [
        { label: 'Email',         value: profile.email },
        { label: 'Phone',         value: profile.phoneNumber ?? '—' },
        { label: 'Sex',           value: ci?.sex ?? '—' },
        { label: 'Date of birth', value: ci?.dateOfBirth ? new Date(ci.dateOfBirth).toLocaleDateString() : '—' },
        { label: 'Country',       value: ci?.countryOfBirth ?? '—' },
        { label: 'Member since',  value: new Date(profile.createdAt).toLocaleDateString() },
    ];

    return (
        <Card
            strength="strong"
            className="animate-fade-up"
            style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
        >
            {/* Avatar + name row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ProfileImageUpload
                    userId={profile.id}
                    imageUrl={profile.profileImageUrl}
                    initials={initials}
                    onUpload={onImageUpload}
                />

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
                        {fullName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <StatusBadge
                            status={profile.isIdVerified ? 'verified' : 'pending'}
                            label={profile.isIdVerified ? 'ID Verified' : 'Verification pending'}
                            pulse={profile.isIdVerified}
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
                {fields.map(({ label, value }) => (
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

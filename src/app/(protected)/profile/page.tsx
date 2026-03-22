'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { ProfileCard, PlatformIdCard, VerificationStatus } from '@/components/pages/profile';
import { EditProfileModal } from '@/components/pages/profile/EditProfileModal';
import { ChangePasswordModal } from '@/components/pages/profile/ChangePasswordModal';
import { Button, PremiumLoader } from '@/components/ui';
import { useApi } from '@/lib/hooks/useApi';
import { getProfileApi, UserProfileResponse } from '@/api/users/get-profile.api';

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    const syncStore = useCallback(
        (p: UserProfileResponse) => {
            setUser({
                userId: p.id,
                email: p.email,
                phoneNumber: p.phoneNumber,
                imageUrl: p.profileImageUrl,
                surName: p.citizenIdentity?.surName ?? '',
                postNames: p.citizenIdentity?.postNames ?? '',
                sex: p.citizenIdentity?.sex ?? '',
                isIdVerified: p.isIdVerified,
                idVerifiedAt: p.idVerifiedAt,
                createdAt: p.createdAt,
            });
        },
        [setUser],
    );

    const { execute: fetchProfile, loading } = useApi(getProfileApi, {
        onSuccess: (data) => {
            setProfile(data);
            syncStore(data);
        },
    });

    useEffect(() => {
        void fetchProfile();
    }, [fetchProfile]);

    const handleImageUpload = (newUrl: string) => {
        setProfile((prev) => (prev ? { ...prev, profileImageUrl: newUrl } : prev));
        if (user) {
            setUser({ ...user, imageUrl: newUrl });
        }
    };

    const handleProfileUpdate = (updatedProfile: UserProfileResponse) => {
        setProfile(updatedProfile);
        syncStore(updatedProfile);
    };

    if (loading || !profile) {
        return (
            <div
                style={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <PremiumLoader size={40} color="primary" />
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: 760,
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
            }}
        >
            {/* Page header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: 6,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Welcome, {profile.citizenIdentity?.postNames ?? 'User'}
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
                        Here&apos;s an overview of your account and verification status.
                    </p>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPasswordOpen(true)}
                    >
                        Change password
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setEditOpen(true)}
                    >
                        Edit profile
                    </Button>
                </div>
            </div>

            {/* Verification status banner */}
            <VerificationStatus />

            {/* Profile card */}
            <ProfileCard
                profile={profile}
                onImageUpload={handleImageUpload}
            />

            {/* Platform ID — only when verified and ID exists */}
            {profile.isIdVerified && profile.platformId && (
                <PlatformIdCard platformId={profile.platformId} />
            )}

            {/* Modals */}
            <EditProfileModal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                onSuccess={handleProfileUpdate}
                currentProfile={profile}
            />
            <ChangePasswordModal
                isOpen={passwordOpen}
                onClose={() => setPasswordOpen(false)}
            />
        </div>
    );
}

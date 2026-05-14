'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { ProfileCard, PlatformIdCard, VerificationStatus } from '@/components/pages/profile';
import { EditProfileModal } from '@/components/pages/profile/EditProfileModal';
import { ChangePasswordModal } from '@/components/pages/profile/ChangePasswordModal';
import { AppLoadingState, Button } from '@/components/ui';
import { useApi } from '@/lib/hooks/useApi';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { normalizeImageUrl } from '@/lib/normalize-image-url';
import { getProfileApi, UserProfileResponse } from '@/api/users/get-profile.api';
import styles from './profile-page.module.css';

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    usePageTitle('Profile');

    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    const syncStore = useCallback(
        (p: UserProfileResponse) => {
            setUser({
                userId: p.id,
                email: p.email,
                phoneNumber: p.phoneNumber,
                imageUrl: normalizeImageUrl(p.profileImageUrl),
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

    const { execute: fetchProfile, loading: profileLoading } = useApi(getProfileApi, {
        onSuccess: (data) => {
            setProfile(data);
            syncStore(data);
        },
    });

    useEffect(() => { void fetchProfile(); }, [fetchProfile]);

    const handleImageUpload = (newUrl: string) => {
        setProfile((prev) => (prev ? { ...prev, profileImageUrl: newUrl } : prev));
        if (user) setUser({ ...user, imageUrl: normalizeImageUrl(newUrl) });
    };

    const handleProfileUpdate = (updated: UserProfileResponse) => {
        setProfile(updated);
        syncStore(updated);
    };

    if (profileLoading || !profile) {
        return (
            <AppLoadingState
                variant="panel"
                minHeight="60vh"
                message="Loading your profile..."
                detail="Syncing identity and account settings"
            />
        );
    }

    return (
        <div className={styles.page}>
            {/* ── Page header ── */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        {profile.citizenIdentity?.postNames ?? 'My Account'}
                    </h1>
                    <p className={styles.subtitle}>
                        Manage your identity and security settings.
                    </p>
                </div>

                <div className={styles.actions}>
                    <Button variant="ghost" size="sm" onClick={() => setPasswordOpen(true)}>
                        Change password
                    </Button>
                    <Button size="sm" onClick={() => setEditOpen(true)}>
                        Edit profile
                    </Button>
                </div>
            </div>

            {/* ── Content ── */}
            <div className={styles.content}>
                <VerificationStatus />

                <ProfileCard
                    profile={profile}
                    onImageUpload={handleImageUpload}
                />

                {profile.isIdVerified && profile.platformId && (
                    <PlatformIdCard platformId={profile.platformId} />
                )}
            </div>

            {/* ── Modals ── */}
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

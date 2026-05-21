/**
 * Profile settings page inside the settings workspace.
 */
'use client';

import Link from 'next/link';
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

/**
 * Renders profile management in the shared settings layout.
 */
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

    const identityName = profile.citizenIdentity
        ? `${profile.citizenIdentity.postNames} ${profile.citizenIdentity.surName}`.trim()
        : 'My Account';
    const memberSince = new Date(profile.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const profileUpdated = new Date(profile.updatedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const readinessItems = [
        {
            label: 'Identity',
            value: profile.isIdVerified ? 'Verified' : 'Needs verification',
            tone: profile.isIdVerified ? styles.ready : styles.warning,
            detail: profile.isIdVerified ? 'National ID approved' : 'Verify to unlock protected actions',
        },
        {
            label: 'Signature',
            value: 'Manage setup',
            tone: styles.neutral,
            detail: 'Keys, certificate, and visible signature',
        },
        {
            label: 'Account',
            value: profile.isActive ? 'Active' : 'Inactive',
            tone: profile.isActive ? styles.ready : styles.warning,
            detail: `Member since ${memberSince}`,
        },
    ];

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div>
                    <p className={styles.eyebrow}>Account profile</p>
                    <h1 className={styles.title}>
                        {identityName}
                    </h1>
                    <p className={styles.subtitle}>
                        Manage your personal details, verification state, profile photo, platform ID,
                        and security settings from one place.
                    </p>
                    <div className={styles.heroMeta}>
                        <span>{profile.email}</span>
                        <span>Updated {profileUpdated}</span>
                    </div>
                </div>

                <div className={styles.actionPanel}>
                    <p className={styles.actionTitle}>Quick actions</p>
                    <div className={styles.actions}>
                        <Button size="sm" onClick={() => setEditOpen(true)}>
                            Edit profile
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setPasswordOpen(true)}>
                            Change password
                        </Button>
                    </div>
                </div>
            </section>

            <section className={styles.readinessGrid} aria-label="Account readiness">
                {readinessItems.map((item) => (
                    <div key={item.label} className={styles.readinessCard}>
                        <span className={styles.readinessLabel}>{item.label}</span>
                        <strong className={item.tone}>{item.value}</strong>
                        <p>{item.detail}</p>
                    </div>
                ))}
            </section>

            <div className={styles.workspace}>
                <main className={styles.primaryColumn}>
                    <VerificationStatus />

                    <ProfileCard
                        profile={profile}
                        onImageUpload={handleImageUpload}
                    />

                    {profile.isIdVerified && profile.platformId && (
                        <PlatformIdCard platformId={profile.platformId} />
                    )}
                </main>

                <aside className={styles.sidePanel} aria-label="Profile guidance">
                    <div className={styles.sideSection}>
                        <p className={styles.sideTitle}>Account checklist</p>
                        <ChecklistItem done={profile.isIdVerified} label="Verify National ID" />
                        <ChecklistItem done={!!profile.profileImageUrl} label="Add profile photo" />
                        <ChecklistItem done={!!profile.phoneNumber} label="Add phone number" />
                        <ChecklistItem done={!!profile.platformId} label="Platform ID issued" />
                    </div>

                    <div className={styles.sideSection}>
                        <p className={styles.sideTitle}>Recommended next step</p>
                        <p className={styles.sideCopy}>
                            Keep your profile and signature setup ready before preparing or signing documents.
                        </p>
                        <div className={styles.sideLinks}>
                            {!profile.isIdVerified && (
                                <Link href="/verify-identity" className={styles.sideLink}>
                                    Verify identity
                                </Link>
                            )}
                            <Link href="/signature" className={styles.sideLink}>
                                Open signature setup
                            </Link>
                        </div>
                    </div>

                    <div className={styles.sideSection}>
                        <p className={styles.sideTitle}>Security note</p>
                        <p className={styles.sideCopy}>
                            Change your password immediately if you suspect your account was accessed by someone else.
                        </p>
                    </div>
                </aside>
            </div>

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

/**
 * Renders one account readiness checklist row.
 */
function ChecklistItem({
    done,
    label,
}: {
    done: boolean;
    label: string;
}) {
    return (
        <div className={styles.checkItem}>
            <span className={done ? styles.checkDone : styles.checkPending}>
                {done ? '✓' : '•'}
            </span>
            <span>{label}</span>
        </div>
    );
}

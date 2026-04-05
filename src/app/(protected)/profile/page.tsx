'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { ProfileCard } from '@/components/pages/profile';
import { PlatformIdCard } from '@/components/pages/profile';
import { VerificationStatus } from '@/components/pages/profile';
import { EditProfileModal } from '@/components/pages/profile/EditProfileModal';
import { ChangePasswordModal } from '@/components/pages/profile/ChangePasswordModal';
import { KeyPairCard } from '@/components/pages/signature';
import { CertificateCard } from '@/components/pages/signature';
import { SignatureImageCard } from '@/components/pages/signature';
import { Button, PremiumLoader } from '@/components/ui';
import { useApi } from '@/lib/hooks/useApi';
import { getProfileApi } from '@/api/users/get-profile.api';
import type { UserProfileResponse } from '@/api/users/get-profile.api';
import {
    getPublicKey,
    getCurrentCertificate,
    getSignatureImage,
} from '@/api/signature/signature.api';
import type {
    KeyPairResponse,
    CertificateResponse,
    SignatureImageResponse,
} from '@/api/signature/signature.api';

type ProfileTab = 'profile' | 'signature';

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();
    const [tab, setTab] = useState<ProfileTab>('profile');
    const [profile, setProfile] = useState<UserProfileResponse | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [passwordOpen, setPasswordOpen] = useState(false);

    // Signature state
    const [keyPair, setKeyPair] = useState<KeyPairResponse | null>(null);
    const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
    const [sigImage, setSigImage] = useState<SignatureImageResponse | null>(null);
    const [sigLoading, setSigLoading] = useState(false);

    // ── Profile load ───────────────────────────────────────────────────────────

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

    const { execute: fetchProfile, loading: profileLoading } = useApi(getProfileApi, {
        onSuccess: (data) => {
            setProfile(data);
            syncStore(data);
        },
    });

    useEffect(() => { void fetchProfile(); }, [fetchProfile]);

    // ── Signature load — only when signature tab is opened ────────────────────

    const loadSignatureData = useCallback(async () => {
        setSigLoading(true);
        const [kp, cert, img] = await Promise.allSettled([
            getPublicKey(),
            getCurrentCertificate(),
            getSignatureImage(),
        ]);
        setKeyPair(kp.status === 'fulfilled' ? kp.value : null);
        setCertificate(cert.status === 'fulfilled' ? cert.value : null);
        setSigImage(img.status === 'fulfilled' ? img.value : null);
        setSigLoading(false);
    }, []);

    // Load signature data when tab is first switched to
    const [sigLoaded, setSigLoaded] = useState(false);
    useEffect(() => {
        if (tab === 'signature' && !sigLoaded) {
            setSigLoaded(true);
            void loadSignatureData();
        }
    }, [tab, sigLoaded, loadSignatureData]);

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleImageUpload = (newUrl: string) => {
        setProfile(prev => prev ? { ...prev, profileImageUrl: newUrl } : prev);
        if (user) setUser({ ...user, imageUrl: newUrl });
    };

    const handleProfileUpdate = (updated: UserProfileResponse) => {
        setProfile(updated);
        syncStore(updated);
    };

    // ── Loading state ──────────────────────────────────────────────────────────

    if (profileLoading || !profile) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PremiumLoader size={40} color="primary" />
            </div>
        );
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

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
                        {profile.citizenIdentity?.postNames ?? 'Profile'}
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
                        Manage your identity, security, and digital signature.
                    </p>
                </div>

                {/* Action buttons — only on profile tab */}
                {tab === 'profile' && (
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <Button variant="ghost" size="sm" onClick={() => setPasswordOpen(true)}>
                            Change password
                        </Button>
                        <Button size="sm" onClick={() => setEditOpen(true)}>
                            Edit profile
                        </Button>
                    </div>
                )}
            </div>

            {/* ── Tab bar ── */}
            <div
                style={{
                    display: 'flex',
                    gap: 4,
                    padding: 4,
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    width: 'fit-content',
                }}
            >
                {([
                    { id: 'profile', label: '👤  Profile' },
                    { id: 'signature', label: '📜  Digital Signature' },
                ] as { id: ProfileTab; label: string }[]).map(({ id, label }) => {
                    const active = tab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            style={{
                                padding: '9px 20px',
                                borderRadius: 'var(--radius-md)',
                                border: active ? '1px solid var(--color-border-primary)' : '1px solid transparent',
                                background: active ? 'var(--color-primary)' : 'transparent',
                                color: active ? '#ffffff' : 'var(--color-text-secondary)',
                                fontSize: 14,
                                fontWeight: active ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 150ms ease',
                                fontFamily: 'var(--font-sans)',
                                whiteSpace: 'nowrap',
                                // Active tab: subtle glow matching the 3D button pattern
                                boxShadow: active ? '0 2px 0 0 var(--color-primary-active), 0 4px 12px var(--color-primary-glow)' : 'none',
                            }}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab content ── */}

            {/* Profile tab */}
            {tab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 180ms ease' }}>
                    <VerificationStatus />
                    <ProfileCard profile={profile} onImageUpload={handleImageUpload} />
                    {profile.isIdVerified && profile.platformId && (
                        <PlatformIdCard platformId={profile.platformId} />
                    )}
                </div>
            )}

            {/* Signature tab */}
            {tab === 'signature' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 180ms ease' }}>
                    {sigLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
                            <PremiumLoader size={36} color="primary" />
                        </div>
                    ) : (
                        <>
                            {/* Setup progress */}
                            <SignatureSetupProgress
                                hasKeyPair={!!keyPair}
                                hasCertificate={!!certificate && !certificate.isRevoked && !certificate.isExpired}
                            />
                            <KeyPairCard keyPair={keyPair} onRefresh={loadSignatureData} />
                            <CertificateCard certificate={certificate} hasKeyPair={!!keyPair} onRefresh={loadSignatureData} />
                            <SignatureImageCard image={sigImage} onRefresh={loadSignatureData} />
                        </>
                    )}
                </div>
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

// ── Setup progress bar — shown on signature tab ────────────────────────────

function SignatureSetupProgress({
    hasKeyPair,
    hasCertificate,
}: {
    hasKeyPair: boolean;
    hasCertificate: boolean;
}) {
    const steps = [
        { n: '1', label: 'Generate Key Pair', done: hasKeyPair, active: !hasKeyPair },
        { n: '2', label: 'Issue Certificate', done: hasCertificate, active: hasKeyPair && !hasCertificate },
        { n: '3', label: 'Ready to Sign', done: hasCertificate, active: false },
    ];

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '16px 24px',
                gap: 0,
            }}
        >
            {steps.map((step, i) => (
                <div key={step.n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 700,
                                background: step.done
                                    ? 'var(--color-success)'
                                    : step.active
                                        ? 'var(--color-primary)'
                                        : 'var(--color-bg-elevated-hover)',
                                color: step.done || step.active ? '#fff' : 'var(--color-text-muted)',
                                boxShadow: step.active
                                    ? '0 0 0 3px var(--color-primary-subtle)'
                                    : 'none',
                                transition: 'all 300ms ease',
                            }}
                        >
                            {step.done ? '✓' : step.n}
                        </div>
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: step.active ? 600 : 400,
                                color: step.done
                                    ? 'var(--color-success)'
                                    : step.active
                                        ? 'var(--color-text-primary)'
                                        : 'var(--color-text-muted)',
                            }}
                        >
                            {step.label}
                        </span>
                    </div>

                    {i < steps.length - 1 && (
                        <div
                            style={{
                                flex: 1,
                                height: 1,
                                margin: '0 12px',
                                background: step.done
                                    ? 'var(--color-success)'
                                    : 'var(--color-border)',
                                transition: 'background 300ms ease',
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
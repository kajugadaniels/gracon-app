'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth.store';
import { ProfileCard, PlatformIdCard, VerificationStatus } from '@/components/pages/profile';
import { EditProfileModal } from '@/components/pages/profile/EditProfileModal';
import { ChangePasswordModal } from '@/components/pages/profile/ChangePasswordModal';
import { Button, PremiumLoader } from '@/components/ui';
import { useApi } from '@/lib/hooks/useApi';
import { getProfileApi, UserProfileResponse } from '@/api/users/get-profile.api';
import { KeyPairCard } from '@/components/pages/signature';
import { CertificateCard } from '@/components/pages/signature';
import { SignatureImageCard } from '@/components/pages/signature';
import type {
    KeyPairResponse,
    CertificateResponse,
    SignatureImageResponse,
} from '@/api/signature/signature.api';
import {
    getPublicKey,
    getCurrentCertificate,
    getSignatureImage,
} from '@/api/signature/signature.api';

type ProfileTab = 'profile' | 'signature';

const TABS: { id: ProfileTab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'signature', label: 'Digital Signature', icon: '📜' },
];

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();

    // ─── Profile data ───────────────────────────────────────────────────────────
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

    const { execute: fetchProfile, loading: profileLoading } = useApi(getProfileApi, {
        onSuccess: (data) => {
            setProfile(data);
            syncStore(data);
        },
    });

    useEffect(() => { void fetchProfile(); }, [fetchProfile]);

    const handleImageUpload = (newUrl: string) => {
        setProfile((prev) => (prev ? { ...prev, profileImageUrl: newUrl } : prev));
        if (user) setUser({ ...user, imageUrl: newUrl });
    };

    const handleProfileUpdate = (updated: UserProfileResponse) => {
        setProfile(updated);
        syncStore(updated);
    };

    // ─── Signature data ─────────────────────────────────────────────────────────
    const [keyPair, setKeyPair] = useState<KeyPairResponse | null>(null);
    const [certificate, setCertificate] = useState<CertificateResponse | null>(null);
    const [sigImage, setSigImage] = useState<SignatureImageResponse | null>(null);
    const [sigLoading, setSigLoading] = useState(false);
    // Prevents re-firing the auto-load effect when all requests fail (service down).
    // Manual refreshes via onRefresh still work — they call loadSignatureData directly.
    const sigAutoLoadFired = useRef(false);

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

    // ─── Tab state ──────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

    // Load signature data once when user first switches to the tab.
    // Using a ref guard so a failed load (service unavailable) doesn't
    // re-trigger the effect infinitely when keyPair stays null.
    useEffect(() => {
        if (activeTab === 'signature' && !sigAutoLoadFired.current && !sigLoading) {
            sigAutoLoadFired.current = true;
            void loadSignatureData();
        }
    }, [activeTab, sigLoading, loadSignatureData]);

    // ─── Loading state ──────────────────────────────────────────────────────────
    if (profileLoading || !profile) {
        return (
            <div
                style={{
                    minHeight: '60vh', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
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
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
            }}
        >
            {/* ── Page header ──────────────────────────────────────────────────── */}
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
                        {profile.citizenIdentity?.postNames ?? 'My Account'}
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
                        Manage your identity, security, and digital signature settings.
                    </p>
                </div>

                {/* Action buttons — only shown on Profile tab */}
                {activeTab === 'profile' && (
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

            {/* ── Tab bar ──────────────────────────────────────────────────────── */}
            <div
                role="tablist"
                aria-label="Profile sections"
                style={{
                    display: 'flex',
                    gap: 4,
                    padding: 4,
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 9999,
                    width: 'fit-content',
                    boxShadow: 'var(--glass-shadow)',
                }}
            >
                {TABS.map((tab) => {
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 7,
                                padding: '8px 20px',
                                borderRadius: 9999,
                                border: 'none',
                                background: active ? 'var(--color-primary)' : 'transparent',
                                color: active ? '#ffffff' : 'var(--color-text-secondary)',
                                fontSize: 13,
                                fontWeight: active ? 600 : 400,
                                fontFamily: 'var(--font-sans)',
                                cursor: 'pointer',
                                boxShadow: active
                                    ? '0 2px 8px rgba(91,35,255,0.30), 0 1px 0 rgba(255,255,255,0.12) inset'
                                    : 'none',
                                transition: 'all 180ms cubic-bezier(0.4,0,0.2,1)',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => {
                                if (!active) {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(91,35,255,0.06)';
                                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!active) {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
                                }
                            }}
                        >
                            <span style={{ fontSize: 14 }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── Tab panels ───────────────────────────────────────────────────── */}

            {/* Profile tab */}
            {activeTab === 'profile' && (
                <div
                    style={{ animation: 'slide-up-sm 220ms cubic-bezier(0.16,1,0.3,1) both' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <VerificationStatus />

                        <ProfileCard
                            profile={profile}
                            onImageUpload={handleImageUpload}
                        />

                        {profile.isIdVerified && profile.platformId && (
                            <PlatformIdCard platformId={profile.platformId} />
                        )}
                    </div>
                </div>
            )}

            {/* Digital Signature tab */}
            {activeTab === 'signature' && (
                <div
                    style={{ animation: 'slide-up-sm 220ms cubic-bezier(0.16,1,0.3,1) both' }}
                >
                    {sigLoading ? (
                        <div
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                minHeight: 320,
                            }}
                        >
                            <PremiumLoader size={36} color="primary" />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Setup progress */}
                            <SignatureSetupProgress
                                hasKeyPair={!!keyPair}
                                hasCertificate={!!certificate && !certificate.isRevoked}
                            />

                            <KeyPairCard keyPair={keyPair} onRefresh={loadSignatureData} />
                            <CertificateCard certificate={certificate} hasKeyPair={!!keyPair} onRefresh={loadSignatureData} />
                            <SignatureImageCard image={sigImage} onRefresh={loadSignatureData} />
                        </div>
                    )}
                </div>
            )}

            {/* ── Modals ───────────────────────────────────────────────────────── */}
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

// ─── Setup progress bar (inline — no separate file needed) ───────────────────

function SignatureSetupProgress({
    hasKeyPair,
    hasCertificate,
}: {
    hasKeyPair: boolean;
    hasCertificate: boolean;
}) {
    const steps = [
        { n: 1, label: 'Generate Key Pair', done: hasKeyPair, active: !hasKeyPair },
        { n: 2, label: 'Issue Certificate', done: hasCertificate, active: hasKeyPair && !hasCertificate },
        { n: 3, label: 'Ready to Sign', done: hasCertificate, active: false },
    ];

    return (
        <div
            className="glass"
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 24px',
                borderRadius: 'var(--radius-xl)',
            }}
        >
            {steps.map((step, i) => (
                <div
                    key={step.n}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: i < steps.length - 1 ? 1 : 'none',
                    }}
                >
                    {/* Step circle + label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        <div
                            style={{
                                width: 28, height: 28, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700,
                                background: step.done
                                    ? 'var(--color-success)'
                                    : step.active
                                        ? 'var(--color-primary)'
                                        : 'rgba(91,35,255,0.08)',
                                color: step.done || step.active ? '#fff' : 'var(--color-text-muted)',
                                boxShadow: step.active ? '0 0 0 3px rgba(91,35,255,0.15)' : 'none',
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

                    {/* Connector line */}
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
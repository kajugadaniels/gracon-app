'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, toast } from '@/components/ui';
import { useApi } from '@/lib/hooks/useApi';
import { updateProfileApi, UpdateProfilePayload } from '@/api/users/update-profile.api';
import { UserProfileResponse } from '@/api/users/get-profile.api';

// ── Validation schema ──────────────────────────────────────────────────────

const schema = z.object({
    phoneNumber: z
        .string()
        .trim()
        .regex(/^\+?[\d\s\-()]{7,20}$/, 'Please provide a valid phone number')
        .optional()
        .or(z.literal('')),
    email: z
        .string()
        .trim()
        .email('Please provide a valid email address')
        .optional()
        .or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

// ── Props ──────────────────────────────────────────────────────────────────

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedProfile: UserProfileResponse) => void;
    currentProfile: UserProfileResponse;
}

// ── Component ──────────────────────────────────────────────────────────────

export function EditProfileModal({
    isOpen,
    onClose,
    onSuccess,
    currentProfile,
}: EditProfileModalProps) {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            phoneNumber: currentProfile.phoneNumber ?? '',
            email: currentProfile.email,
        },
    });

    // Re-seed form when the profile prop changes (e.g. after a previous update)
    useEffect(() => {
        reset({
            phoneNumber: currentProfile.phoneNumber ?? '',
            email: currentProfile.email,
        });
    }, [currentProfile, reset]);

    const emailValue = watch('email');
    const isEmailChanging =
        emailValue?.trim() !== '' && emailValue !== currentProfile.email;

    const { execute: submitUpdate, loading } = useApi(
        (payload: UpdateProfilePayload) => updateProfileApi(payload),
        {
            onSuccess: (updatedProfile) => {
                toast.success('Profile updated successfully');
                onSuccess(updatedProfile);
                onClose();
            },
        },
    );

    const onSubmit = (values: FormValues) => {
        const payload: UpdateProfilePayload = {};

        if (values.phoneNumber !== undefined && values.phoneNumber !== '') {
            payload.phoneNumber = values.phoneNumber;
        }
        if (values.email && values.email !== '') {
            payload.email = values.email;
        }

        void submitUpdate(payload);
    };

    if (!isOpen) return null;

    return (
        // Backdrop — full-screen overlay, click-outside closes
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 16,
                background: 'rgba(22, 16, 58, 0.40)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
            }}
        >
            {/* Card — stop propagation so clicks inside don't close */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="glass-strong animate-fade-up"
                style={{
                    width: '100%',
                    maxWidth: 480,
                    borderRadius: 'var(--radius-xl)',
                    padding: 32,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                }}
            >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: 18,
                                fontWeight: 700,
                                color: 'var(--color-text-primary)',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Edit profile
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                            Update your contact information
                        </p>
                    </div>

                    {/* X close button */}
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        style={{
                            background: 'rgba(91,35,255,0.07)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '50%',
                            width: 34,
                            height: 34,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-text-secondary)',
                            flexShrink: 0,
                            transition: 'background 150ms ease',
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                    noValidate
                >
                    <Input
                        label="Phone number"
                        type="tel"
                        placeholder="+250 788 123 456"
                        error={errors.phoneNumber?.message}
                        {...register('phoneNumber')}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <Input
                            label="Email address"
                            type="email"
                            placeholder="you@example.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        {/* Warn only when the user has actually changed the email */}
                        {isEmailChanging && (
                            <div
                                className="animate-fade-in"
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 8,
                                    padding: '10px 12px',
                                    background: 'rgba(217,119,6,0.08)',
                                    border: '1px solid rgba(217,119,6,0.22)',
                                    borderRadius: 'var(--radius-sm)',
                                }}
                            >
                                <svg
                                    width="15" height="15" viewBox="0 0 24 24"
                                    fill="currentColor"
                                    style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 1 }}
                                >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                                <p style={{ margin: 0, fontSize: 12, color: 'var(--color-warning)', lineHeight: 1.5 }}>
                                    Changing your email will require you to verify it again before you can log in.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            loading={loading}
                            loadingText="Saving…"
                        >
                            Save changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

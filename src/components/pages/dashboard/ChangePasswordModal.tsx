'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, toast } from '@/components/ui';
import { PasswordStrength } from '@/components/pages/auth/register/PasswordStrength';
import { useApi } from '@/lib/hooks/useApi';
import { useAuthStore } from '@/lib/store/auth.store';
import { changePasswordApi, ChangePasswordPayload } from '@/api/users/change-password.api';

// ── Validation schema ──────────────────────────────────────────────────────

const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]/;

const schema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must be at most 128 characters')
            .regex(
                PASSWORD_REGEX,
                'Must contain uppercase, lowercase, number, and special character (@$!%*?&^#)',
            ),
        confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'Passwords do not match',
        path: ['confirmNewPassword'],
    });

type FormValues = z.infer<typeof schema>;

// ── Props ──────────────────────────────────────────────────────────────────

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const router = useRouter();
    const clearAuth = useAuthStore((s) => s.clearAuth);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },
    });

    const newPasswordValue = watch('newPassword');

    const { execute: submitChange, loading } = useApi(
        (payload: ChangePasswordPayload) => changePasswordApi(payload),
        {
            onSuccess: () => {
                toast.success('Password changed — please log in again');
                reset();
                onClose();

                // Short delay so the toast is readable before the redirect
                setTimeout(() => {
                    clearAuth();
                    router.push('/login');
                }, 1500);
            },
        },
    );

    const onSubmit = (values: FormValues) => {
        void submitChange({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
            confirmNewPassword: values.confirmNewPassword,
        });
    };

    if (!isOpen) return null;

    return (
        // Backdrop
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
            {/* Card */}
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
                {/* Header */}
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
                            Change password
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                            You will be signed out of all other devices
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
                        label="Current password"
                        showPasswordToggle
                        error={errors.currentPassword?.message}
                        autoComplete="current-password"
                        {...register('currentPassword')}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Input
                            label="New password"
                            showPasswordToggle
                            error={errors.newPassword?.message}
                            autoComplete="new-password"
                            {...register('newPassword')}
                        />

                        {/* Strength indicator — visible as soon as the user types */}
                        <PasswordStrength password={newPasswordValue} />
                    </div>

                    <Input
                        label="Confirm new password"
                        showPasswordToggle
                        error={errors.confirmNewPassword?.message}
                        autoComplete="new-password"
                        {...register('confirmNewPassword')}
                    />

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
                            loadingText="Changing…"
                        >
                            Change password
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

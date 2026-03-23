'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { toast } from '@/components/ui';
import { PasswordStrength } from '@/components/pages/auth/register/PasswordStrength';
import { validateResetTokenApi } from '@/api/auth/validate-reset-token.api';
import { resetPasswordApi } from '@/api/auth/reset-password.api';
import { useApi } from '@/lib/hooks/useApi';

// ── Validation schema ─────────────────────────────────────────

const schema = z
    .object({
        newPassword: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128)
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])/,
                'Must include uppercase, lowercase, number, and special character',
            ),
        confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type FormFields = z.infer<typeof schema>;

// ── Token validation states ───────────────────────────────────

type TokenState = 'validating' | 'valid' | 'invalid' | 'success';

export function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId') ?? '';
    const token = searchParams.get('token') ?? '';

    const [tokenState, setTokenState] = useState<TokenState>('validating');
    const [tokenError, setTokenError] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormFields>({ resolver: zodResolver(schema), mode: 'onChange' });

    const watchPassword = watch('newPassword', '');

    // ── Validate token on mount ───────────────────────────────────

    useEffect(() => {
        if (!userId || !token) {
            setTokenState('invalid');
            setTokenError('Invalid reset link. Please request a new one.');
            return;
        }

        validateResetTokenApi(userId, token)
            .then((res) => {
                if (res.data.valid) {
                    setTokenState('valid');
                } else {
                    setTokenState('invalid');
                    setTokenError(res.data.message);
                }
            })
            .catch(() => {
                setTokenState('invalid');
                setTokenError(
                    'Unable to validate reset link. Please request a new one.',
                );
            });
    }, [userId, token]);

    // ── Reset password API call ───────────────────────────────────

    const { execute: reset, loading } = useApi(resetPasswordApi, {
        showErrorToast: true,
        onSuccess: () => {
            setTokenState('success');
            toast.success('Password reset!', {
                description: 'You can now log in with your new password.',
            });
        },
    });

    const onSubmit = (values: FormFields) => {
        reset({
            userId,
            token,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
        });
    };

    // ── Validating token state ────────────────────────────────────

    if (tokenState === 'validating') {
        return (
            <Card strength="strong" style={{ width: '100%', maxWidth: 420 }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 16,
                        padding: '24px 0',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: '3px solid rgba(255,255,255,0.10)',
                            borderTopColor: 'var(--color-primary)',
                            animation: 'btn-spin 0.75s linear infinite',
                        }}
                    />
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
                        Validating your reset link...
                    </p>
                </div>
            </Card>
        );
    }

    // ── Invalid token state ───────────────────────────────────────

    if (tokenState === 'invalid') {
        return (
            <Card strength="strong" style={{ width: '100%', maxWidth: 420 }}>
                <div
                    className="animate-fade-up"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20,
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            width: 68,
                            height: 68,
                            borderRadius: '50%',
                            background: 'var(--color-error-subtle)',
                            border: '2px solid var(--color-error-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 30,
                            color: 'var(--color-error)',
                        }}
                    >
                        ✕
                    </div>

                    <div>
                        <h1
                            style={{
                                fontSize: 24,
                                fontWeight: 700,
                                color: 'var(--color-text-primary)',
                                marginBottom: 8,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Link invalid or expired
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                            {tokenError}
                        </p>
                    </div>

                    <Button fullWidth onClick={() => window.location.href = '/forgot-password'}>
                        Request a new link
                    </Button>


                    <a
                        href="/login"
                        style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}
                    >
                        Back to login
                    </a>
            </div>
      </Card >
    );
    }

    // ── Success state ─────────────────────────────────────────────

    if (tokenState === 'success') {
        return (
            <Card strength="strong" style={{ width: '100%', maxWidth: 420 }}>
                <div
                    className="animate-fade-up"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 20,
                        textAlign: 'center',
                    }}
                >
                    <div
                        className="glow-success"
                        style={{
                            width: 68,
                            height: 68,
                            borderRadius: '50%',
                            background: 'var(--color-success-subtle)',
                            border: '2px solid var(--color-success-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 30,
                            color: 'var(--color-success)',
                        }}
                    >
                        ✓
                    </div>

                    <div>
                        <h1
                            style={{
                                fontSize: 24,
                                fontWeight: 700,
                                color: 'var(--color-text-primary)',
                                marginBottom: 8,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Password updated
                        </h1>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                            Your password has been reset successfully. All existing
                            sessions have been signed out for your security.
                        </p>
                    </div>

                    <Button fullWidth onClick={() => window.location.href = '/login'}>
                        Sign in with new password
                    </Button>
                </div>
            </Card>
        );
    }

    // ── Valid token — show reset form ─────────────────────────────

    return (
        <Card strength="strong" style={{ width: '100%', maxWidth: 420 }}>
            <div className="animate-fade-up">
                <div style={{ marginBottom: 32 }}>
                    <h1
                        style={{
                            fontSize: 26,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: 8,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Set new password
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                        Choose a strong password you have not used before.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                    noValidate
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Input
                            label="New password"
                            showPasswordToggle
                            placeholder="Create a strong password"
                            autoComplete="new-password"
                            required
                            error={errors.newPassword?.message}
                            {...register('newPassword')}
                        />
                        <PasswordStrength password={watchPassword} />
                    </div>

                    <Input
                        label="Confirm new password"
                        showPasswordToggle
                        placeholder="Repeat your new password"
                        autoComplete="new-password"
                        required
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                        loadingText="Updating password..."
                    >
                        Update password
                    </Button>
                </form>
            </div>
        </Card>
    );
}
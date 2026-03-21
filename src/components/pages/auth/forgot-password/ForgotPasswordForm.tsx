'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card } from '@/components/ui';
import { toast } from '@/components/ui';
import { forgotPasswordApi } from '@/api/auth/forgot-password.api';
import { useApi } from '@/lib/hooks/useApi';

const schema = z.object({
    email: z
        .string()
        .email('Please enter a valid email address')
        .transform((v) => v.toLowerCase().trim()),
});

type FormFields = z.infer<typeof schema>;

export function ForgotPasswordForm() {
    const [submitted, setSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<FormFields>({ resolver: zodResolver(schema) });

    const { execute: requestReset, loading } = useApi(forgotPasswordApi, {
        // Suppress auto error toast — we handle it manually with a custom message
        showErrorToast: false,
        onSuccess: () => {
            setSubmitted(true);
        },
        onError: () => {
            // Show generic error — never reveal backend details
            toast.error('Something went wrong', {
                description: 'Please try again in a moment.',
            });
        },
    });

    const onSubmit = (values: FormFields) => {
        requestReset({ email: values.email });
    };

    // ── Success state — show regardless of whether email exists
    if (submitted) {
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
                    {/* Envelope icon */}
                    <div
                        style={{
                            width: 68,
                            height: 68,
                            borderRadius: '50%',
                            background: 'var(--color-primary-subtle)',
                            border: '2px solid var(--color-border-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 30,
                        }}
                    >
                        ✉
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
                            Check your email
                        </h1>
                        <p
                            style={{
                                fontSize: 14,
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.6,
                            }}
                        >
                            If <strong style={{ color: 'var(--color-text-primary)' }}>
                                {getValues('email')}
                            </strong> is registered, you will receive a password reset
                            link within a few minutes.
                        </p>
                    </div>

                    <div
                        style={{
                            background: 'var(--color-bg-elevated)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '12px 16px',
                            fontSize: 13,
                            color: 'var(--color-text-muted)',
                            width: '100%',
                            lineHeight: 1.6,
                        }}
                    >
                        Did not receive it? Check your spam folder or wait a few
                        minutes before requesting another link.
                    </div>

                    <Button
                        variant="ghost"
                        fullWidth
                        onClick={() => setSubmitted(false)}
                    >
                        Try a different email
                    </Button>


                    <a
                        href="/login"
                        style={{
                            fontSize: 13,
                            color: 'var(--color-primary)',
                            fontWeight: 500,
                            textDecoration: 'none',
                        }}
                    >
                        Back to login
                    </a>
            </div>
      </Card >
    );
    }

    // ── Form state
    return (
        <Card strength="strong" style={{ width: '100%', maxWidth: 420 }}>
            <div className="animate-fade-up">
                <div style={{ marginBottom: 32 }}>
                    {/* Back link */}

                    <a
                        href="/login"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 13,
                            color: 'var(--color-text-muted)',
                            textDecoration: 'none',
                            marginBottom: 24,
                        }}
                    >
                    <svg
                        width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back to login
                </a>

                <h1
                    style={{
                        fontSize: 26,
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        marginBottom: 8,
                        letterSpacing: '-0.02em',
                    }}
                >
                    Forgot your password?
                </h1>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    Enter your registered email address and we will send you a
                    link to reset your password.
                </p>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                noValidate
            >
                <Input
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    error={errors.email?.message}
                    {...register('email')}
                />

                <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    loadingText="Sending reset link..."
                >
                    Send reset link
                </Button>
            </form>
        </div>
    </Card >
  );
}
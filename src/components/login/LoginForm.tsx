'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { loginApi } from '@/api/auth/login.api';
import { useApi } from '@/lib/hooks/useApi';
import { useAuthStore } from '@/lib/store/auth.store';

// ── Validation schema ─────────────────────────────────────────

const schema = z.object({
    email: z
        .string()
        .email('Please enter a valid email address')
        .transform((v) => v.toLowerCase().trim()),
    password: z
        .string()
        .min(1, 'Password is required')
        .max(128),
});

type LoginFields = z.infer<typeof schema>;

// ── Component ─────────────────────────────────────────────────

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setTokens, setUser } = useAuthStore();

    // Where to redirect after login — defaults to dashboard
    const nextPath = searchParams.get('next') ?? '/dashboard';

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFields>({ resolver: zodResolver(schema) });

    const { execute: login, loading, error } = useApi(loginApi, {
        onSuccess: (res) => {
            const { accessToken, refreshToken, user } = res.data;

            // Store tokens in memory — never localStorage
            setTokens(accessToken, refreshToken);
            setUser(user);

            // Set session indicator cookie — used by middleware for route protection
            // httpOnly is NOT set — middleware needs to read it client-side
            // No sensitive data in this cookie — just a boolean presence flag
            document.cookie = `session_active=1; path=/; SameSite=Strict; max-age=${60 * 60 * 24 * 30}`;

            router.push(
                // If user hasn't done ID verification yet — redirect there first
                !user.isIdVerified ? '/verify-identity' : nextPath,
            );
        },
    });

    const onSubmit = (values: LoginFields) => login(values);

    return (
        <Card strength="strong" style={{ width: '100%', maxWidth: 420 }}>
            <div className="animate-fade-up">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    {/* Logo mark */}
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            fontWeight: 700,
                            color: '#fff',
                            margin: '0 auto 20px',
                            boxShadow: '0 4px 20px var(--color-primary-glow)',
                        }}
                    >
                        ID
                    </div>

                    <h1
                        style={{
                            fontSize: 26,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: 8,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Welcome back
                    </h1>
                    <p
                        style={{
                            fontSize: 14,
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        Sign in to your verified account
                    </p>
                </div>

                {/* Form */}
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

                    <Input
                        label="Password"
                        showPasswordToggle
                        placeholder="Your password"
                        autoComplete="current-password"
                        required
                        error={errors.password?.message}
                        {...register('password')}
                    />

                    {/* API error */}
                    {error && (
                        <div
                            role="alert"
                            style={{
                                background: 'var(--color-error-subtle)',
                                border: '1px solid var(--color-error-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '12px 16px',
                                fontSize: 13,
                                color: 'var(--color-error)',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                        loadingVariant="spinner"
                        loadingText="Signing in..."
                        style={{ marginTop: 4 }}
                    >
                        Sign in
                    </Button>
                </form>

                {/* Footer links */}
                <p
                    style={{
                        textAlign: 'center',
                        fontSize: 13,
                        color: 'var(--color-text-muted)',
                        marginTop: 28,
                    }}
                >
                    Don&apos;t have an account?{' '}

                    href="/register"
                    style={{
                        color: 'var(--color-primary)',
                        fontWeight: 500,
                        textDecoration: 'none',
                    }}
          >
                    Create one
                </a>
            </p>
        </div>
    </Card >
  );
}
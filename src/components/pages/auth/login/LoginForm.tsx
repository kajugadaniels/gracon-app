'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { loginApi } from '@/api/auth/login.api';
import { useApi } from '@/lib/hooks/useApi';
import { useAuthStore } from '@/lib/store/auth.store';

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

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setTokens, setUser } = useAuthStore();

    const nextPath = searchParams.get('next') ?? '/dashboard';

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFields>({ resolver: zodResolver(schema) });

    const { execute: login, loading, error } = useApi(loginApi, {
        onSuccess: (res) => {
            const { accessToken, refreshToken, user } = res.data;

            setTokens(accessToken, refreshToken);
            setUser(user);

            // Set session cookie
            document.cookie =
                `session_active=1; path=/; SameSite=Strict; max-age=${60 * 60 * 24 * 30}`;

            if (res.tokenType === 'limited') {
                // User verified email but hasn't done ID verification yet
                // Redirect to verify-identity — they have a limited token that allows this
                router.push('/verify-identity');
                return;
            }

            // Full token — go to intended destination
            router.push(nextPath);
        },
    });

    const onSubmit = (values: LoginFields) => login(values);

    return (
        <Card strength="strong" style={{ width: '100%', maxWidth: 400 }}>
            <div className="animate-fade-up" style={{ padding: '4px 0' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    {/* Logo mark */}
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            fontWeight: 700,
                            color: '#fff',
                            margin: '0 auto 18px',
                            boxShadow: '0 4px 16px var(--color-primary-glow)',
                        }}
                    >
                        ID
                    </div>

                    <h1
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: 6,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Welcome back
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
                        Sign in to your verified account
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
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
                            className="animate-scale-in"
                            style={{
                                background: 'var(--color-error-subtle)',
                                border: '1px solid var(--color-error-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '10px 14px',
                                fontSize: 13,
                                color: 'var(--color-error)',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>

                        <a
                            href="/forgot-password"
                            style={{
                                fontSize: 12,
                                color: 'var(--color-text-muted)',
                                textDecoration: 'none',
                                fontWeight: 500,
                            }}
                        >
                            Forgot password?
                        </a>
            </div>

            <Button
                type="submit"
                fullWidth
                loading={loading}
                loadingText="Signing in..."
                style={{ marginTop: 4 }}
            >
                Sign in
            </Button>
        </form>

                {/* Footer link */ }
    <p
        style={{
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--color-text-muted)',
            marginTop: 24,
            marginBottom: 0,
        }}
    >
        Don&apos;t have an account?{' '}
        <a
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

            </div >
        </Card >
    );
}

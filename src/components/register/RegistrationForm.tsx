'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { CitizenPreview } from './CitizenPreview';
import { PasswordStrength } from './PasswordStrength';
import { citizenLookupApi, type CitizenData } from '@/api/auth/citizen-lookup.api';
import { registerApi } from '@/api/auth/register.api';
import { useApi } from '@/lib/hooks/useApi';

// ── Validation schemas per step ───────────────────────────────

const step1Schema = z.object({
    documentNumber: z
        .string()
        .length(16, 'National ID must be exactly 16 digits')
        .regex(/^\d{16}$/, 'National ID must contain only digits'),
});

const step2Schema = z
    .object({
        email: z
            .string()
            .email('Please enter a valid email address')
            .transform((v) => v.toLowerCase().trim()),
        phoneNumber: z
            .string()
            .regex(/^\+?[\d\s\-()\\.]{7,20}$/, 'Please enter a valid phone number')
            .optional()
            .or(z.literal('')),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128)
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])/,
                'Must include uppercase, lowercase, number, and special character',
            ),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

type Step1Fields = z.infer<typeof step1Schema>;
type Step2Fields = z.infer<typeof step2Schema>;

// ── Step indicator ────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 32,
            }}
        >
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        width: i === current ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        background:
                            i < current
                                ? 'var(--color-success)'
                                : i === current
                                    ? 'var(--color-primary)'
                                    : 'rgba(255,255,255,0.15)',
                        transition: 'all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                />
            ))}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────

export function RegistrationForm() {
    const router = useRouter();

    // Step 0 = NID entry, Step 1 = account details, Step 2 = success
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [citizenData, setCitizenData] = useState<CitizenData | null>(null);
    const [documentNumber, setDocumentNumber] = useState('');
    const [platformId, setPlatformId] = useState('');

    // ── Step 1 form — NID lookup
    const step1 = useForm<Step1Fields>({
        resolver: zodResolver(step1Schema),
        mode: 'onSubmit',
    });

    // ── Step 2 form — account details
    const step2 = useForm<Step2Fields>({
        resolver: zodResolver(step2Schema),
        mode: 'onChange',
    });

    const watchPassword = step2.watch('password', '');

    // ── API hooks
    const { execute: lookupCitizen, loading: lookupLoading, error: lookupError } =
        useApi(citizenLookupApi, {
            onSuccess: (res) => {
                setCitizenData(res.data);
                setDocumentNumber(step1.getValues('documentNumber'));
                setStep(1);
            },
        });

    const { execute: register, loading: registerLoading, error: registerError } =
        useApi(registerApi, {
            onSuccess: (res) => {
                setPlatformId(res.data.platformId);
                setStep(2);
            },
        });

    // ── Handlers

    const handleStep1Submit = async (values: Step1Fields) => {
        await lookupCitizen({ documentNumber: values.documentNumber });
    };

    const handleStep2Submit = async (values: Step2Fields) => {
        await register({
            documentNumber,
            email: values.email,
            phoneNumber: values.phoneNumber || undefined,
            password: values.password,
        });
    };

    // ── Step 0: NID Entry
    if (step === 0) {
        return (
            <Card strength="strong" style={{ width: '100%', maxWidth: 460 }}>
                <div className="animate-fade-up">
                    <StepDots current={0} total={3} />

                    <h1
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: 8,
                            letterSpacing: '-0.02em',
                            textAlign: 'center',
                        }}
                    >
                        Create your account
                    </h1>
                    <p
                        style={{
                            fontSize: 14,
                            color: 'var(--color-text-secondary)',
                            textAlign: 'center',
                            marginBottom: 32,
                        }}
                    >
                        Enter your National ID number to get started
                    </p>

                    <form
                        onSubmit={step1.handleSubmit(handleStep1Submit)}
                        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                        noValidate
                    >
                        <Input
                            label="National ID number"
                            placeholder="Enter your 16-digit NID"
                            maxLength={16}
                            inputMode="numeric"
                            autoComplete="off"
                            required
                            error={
                                step1.formState.errors.documentNumber?.message ?? lookupError ?? undefined
                            }
                            {...step1.register('documentNumber')}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            loading={lookupLoading}
                            loadingVariant="spinner"
                            loadingText="Looking up your ID..."
                        >
                            Look up my ID
                        </Button>
                    </form>

                    <p
                        style={{
                            textAlign: 'center',
                            fontSize: 13,
                            color: 'var(--color-text-muted)',
                            marginTop: 24,
                        }}
                    >
                        Already have an account?{' '}

                        href="/login"
                        style={{
                            color: 'var(--color-primary)',
                            fontWeight: 500,
                            textDecoration: 'none',
                        }}
            >
                        Log in
                    </a>
                </p>
            </div>
      </Card >
    );
    }

    // ── Step 1: Account Details
    if (step === 1 && citizenData) {
        return (
            <Card
                strength="strong"
                style={{ width: '100%', maxWidth: 520 }}
            >
                <div className="animate-fade-up">
                    <StepDots current={1} total={3} />

                    <h1
                        style={{
                            fontSize: 24,
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            marginBottom: 8,
                            letterSpacing: '-0.02em',
                            textAlign: 'center',
                        }}
                    >
                        Complete your profile
                    </h1>
                    <p
                        style={{
                            fontSize: 14,
                            color: 'var(--color-text-secondary)',
                            textAlign: 'center',
                            marginBottom: 24,
                        }}
                    >
                        We found your details. Now set up your account.
                    </p>

                    {/* Citizen data preview */}
                    <CitizenPreview data={citizenData} />

                    <form
                        onSubmit={step2.handleSubmit(handleStep2Submit)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 20,
                            marginTop: 24,
                        }}
                        noValidate
                    >
                        <Input
                            label="Email address"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                            error={step2.formState.errors.email?.message}
                            {...step2.register('email')}
                        />

                        <Input
                            label="Phone number"
                            type="tel"
                            placeholder="+250 7XX XXX XXX"
                            autoComplete="tel"
                            hint="Optional — used for account recovery"
                            error={step2.formState.errors.phoneNumber?.message}
                            {...step2.register('phoneNumber')}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Input
                                label="Password"
                                showPasswordToggle
                                placeholder="Create a strong password"
                                autoComplete="new-password"
                                required
                                error={step2.formState.errors.password?.message}
                                {...step2.register('password')}
                            />
                            <PasswordStrength password={watchPassword} />
                        </div>

                        <Input
                            label="Confirm password"
                            showPasswordToggle
                            placeholder="Repeat your password"
                            autoComplete="new-password"
                            required
                            error={step2.formState.errors.confirmPassword?.message}
                            {...step2.register('confirmPassword')}
                        />

                        {/* Registration error */}
                        {registerError && (
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
                                {registerError}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 12 }}>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setStep(0)}
                                style={{ flex: 1 }}
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                loading={registerLoading}
                                loadingVariant="dots"
                                loadingText="Creating account..."
                                style={{ flex: 2 }}
                            >
                                Create account
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        );
    }

    // ── Step 2: Success
    if (step === 2) {
        return (
            <Card strength="strong" style={{ width: '100%', maxWidth: 460 }}>
                <div
                    className="animate-fade-up"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 20,
                    }}
                >
                    <StepDots current={2} total={3} />

                    {/* Success icon */}
                    <div
                        className="glow-success"
                        style={{
                            width: 72,
                            height: 72,
                            borderRadius: '50%',
                            background: 'var(--color-success-subtle)',
                            border: '2px solid var(--color-success-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 32,
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
                            Account created!
                        </h1>
                        <p
                            style={{
                                fontSize: 14,
                                color: 'var(--color-text-secondary)',
                                lineHeight: 1.6,
                            }}
                        >
                            Check your email for a verification link. You must verify
                            your email before you can log in.
                        </p>
                    </div>

                    {/* Platform ID — shown once */}
                    {platformId && (
                        <div
                            style={{
                                width: '100%',
                                background: 'var(--color-primary-subtle)',
                                border: '1px solid var(--color-border-primary)',
                                borderRadius: 'var(--radius-md)',
                                padding: '16px 20px',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: 'var(--color-primary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    marginBottom: 6,
                                }}
                            >
                                Your Platform ID — save this
                            </div>
                            <div
                                style={{
                                    fontFamily: 'var(--font-mono, monospace)',
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: 'var(--color-text-primary)',
                                    letterSpacing: '0.12em',
                                }}
                            >
                                {platformId}
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: 'var(--color-text-muted)',
                                    marginTop: 6,
                                }}
                            >
                                This is shown only once. Copy it and store it safely.
                            </div>
                        </div>
                    )}

                    <Button
                        fullWidth
                        onClick={() => router.push('/login')}
                    >
                        Go to login
                    </Button>
                </div>
            </Card>
        );
    }

    return null;
}
/**
 * Renders the document-number confirmation step for identity verification.
 */

import type { UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';
import { Button, Input } from '@/components/ui';

type VerificationIdentityStepProps = {
    title: string;
    description: string;
    error?: string;
    register: UseFormRegister<{ documentNumber: string }>;
    handleSubmit: UseFormHandleSubmit<{ documentNumber: string }>;
    onSubmit: (values: { documentNumber: string }) => void;
};

/**
 * Collects the 16-digit national ID before photo capture begins.
 */
export function VerificationIdentityStep({
    title,
    description,
    error,
    register,
    handleSubmit,
    onSubmit,
}: VerificationIdentityStepProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <h1
                    style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        marginBottom: 8,
                        letterSpacing: '-0.02em',
                    }}
                >
                    {title}
                </h1>
                <p
                    style={{
                        fontSize: 14,
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                    }}
                >
                    {description}
                </p>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
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
                    hint="This must match the ID you used when registering"
                    error={error}
                    {...register('documentNumber')}
                />

                <Button type="submit" fullWidth size="lg">
                    Continue
                </Button>
            </form>
        </div>
    );
}

/**
 * Renders the document-number confirmation step for identity verification.
 */

import type { UseFormHandleSubmit, UseFormRegister } from 'react-hook-form';
import { Button, Input } from '@/components/ui';

type VerificationIdentityStepProps = {
    isInvitationChallenge: boolean;
    error?: string;
    register: UseFormRegister<{ documentNumber: string }>;
    handleSubmit: UseFormHandleSubmit<{ documentNumber: string }>;
    onSubmit: (values: { documentNumber: string }) => void;
};

/**
 * Collects the 16-digit national ID before photo capture begins.
 */
export function VerificationIdentityStep({
    isInvitationChallenge,
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
                    {isInvitationChallenge
                        ? 'Confirm your identity for this invitation'
                        : 'Confirm your ID number'}
                </h1>
                <p
                    style={{
                        fontSize: 14,
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.6,
                    }}
                >
                    {isInvitationChallenge
                        ? 'Enter your 16-digit National ID number to continue the secure invitation challenge. We will compare it against the one registered on your account.'
                        : 'Enter your 16-digit National ID number to begin. We&apos;ll compare it against the one you registered with.'}
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

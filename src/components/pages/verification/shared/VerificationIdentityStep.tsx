/**
 * Shared document-number confirmation step for identity verification.
 */

import type {
    ChangeEvent,
    FormEvent,
} from 'react';

type VerificationIdentityStepProps = {
    title: string;
    description: string;
    error?: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    label?: string;
    placeholder?: string;
    hint?: string;
    continueLabel?: string;
};

const NID_GROUP_LENGTHS = [1, 4, 1, 7, 1, 2] as const;
const FORMATTED_NID_MAX_LENGTH = 21;

/**
 * Formats Rwanda's 16-digit National ID into readable fixed groups while
 * keeping validation and submission backed by the original raw digits.
 */
function formatNationalId(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const groups: string[] = [];
    let offset = 0;

    for (const length of NID_GROUP_LENGTHS) {
        const group = digits.slice(offset, offset + length);
        if (!group) break;

        groups.push(group);
        offset += length;
    }

    return groups.join(' ');
}

const cardTitleStyle = {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: 8,
    letterSpacing: '-0.02em',
} as const;

const cardDescriptionStyle = {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
} as const;

const labelStyle = {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
} as const;

const inputStyle = (hasError: boolean) =>
    ({
        width: '100%',
        borderRadius: 14,
        border: `1px solid ${
            hasError
                ? 'var(--color-error-border)'
                : 'var(--color-border)'
        }`,
        padding: '14px 16px',
        fontSize: 15,
        color: 'var(--color-text-primary)',
        background: 'var(--color-surface)',
        outline: 'none',
    }) as const;

const hintStyle = {
    fontSize: 12,
    color: 'var(--color-text-muted)',
    lineHeight: 1.5,
} as const;

const errorStyle = {
    fontSize: 12,
    color: 'var(--color-error)',
    lineHeight: 1.5,
} as const;

const submitStyle = {
    width: '100%',
    border: 0,
    borderRadius: 14,
    padding: '14px 18px',
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    background: 'var(--color-primary)',
    cursor: 'pointer',
    boxShadow: '0 18px 34px rgba(64, 102, 255, 0.22)',
} as const;

/**
 * Collects the 16-digit national ID before photo capture begins.
 */
export function VerificationIdentityStep({
    title,
    description,
    error,
    value,
    onChange,
    onSubmit,
    label = 'National ID number',
    placeholder = 'Enter your 16-digit NID',
    hint = 'This must match the ID you used when registering',
    continueLabel = 'Continue',
}: VerificationIdentityStepProps) {
    const formattedValue = formatNationalId(value);

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        onChange(event.target.value.replace(/\D/g, '').slice(0, 16));
    }

    function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit();
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
                <h1 style={cardTitleStyle}>{title}</h1>
                <p style={cardDescriptionStyle}>{description}</p>
            </div>

            <form
                onSubmit={handleFormSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                noValidate
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                    }}
                >
                    <label style={labelStyle}>{label}</label>
                    <input
                        type="text"
                        value={formattedValue}
                        onChange={handleInputChange}
                        maxLength={FORMATTED_NID_MAX_LENGTH}
                        inputMode="numeric"
                        autoComplete="off"
                        required
                        placeholder={placeholder}
                        style={inputStyle(Boolean(error))}
                    />
                    {error ? (
                        <p style={errorStyle}>{error}</p>
                    ) : (
                        <p style={hintStyle}>{hint}</p>
                    )}
                </div>

                <button type="submit" style={submitStyle}>
                    {continueLabel}
                </button>
            </form>
        </div>
    );
}

'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

// Loading variants — each tells a different visual story
type LoadingVariant = 'spinner' | 'dots' | 'pulse';
type ButtonVariant = 'primary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    loadingVariant?: LoadingVariant;
    loadingText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
}

// ── Loading indicators ────────────────────────────────────────

// Classic spinner — used for API calls (login, register)
function Spinner() {
    return (
        <span
            aria-hidden="true"
            style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: '2.5px solid rgba(255,255,255,0.25)',
                borderTopColor: '#ffffff',
                display: 'inline-block',
                animation: 'btn-spin 0.65s linear infinite',
                flexShrink: 0,
            }}
        />
    );
}

// Three bouncing dots — used for upload / processing
function DotsLoader() {
    return (
        <span
            aria-hidden="true"
            style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}
        >
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.90)',
                        display: 'inline-block',
                        animation: `btn-pulse-dot 1.1s ease-in-out ${i * 0.18}s infinite`,
                    }}
                />
            ))}
        </span>
    );
}

// Shimmer bar — used for verification / long operations
function PulseLoader() {
    return (
        <span
            aria-hidden="true"
            style={{
                display: 'inline-block',
                width: 80,
                height: 6,
                borderRadius: 3,
                background:
                    'linear-gradient(90deg, rgba(255,255,255,0.15) 25%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.15) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s ease-in-out infinite',
            }}
        />
    );
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { padding: '8px 18px', fontSize: 13, borderRadius: 8 },
    md: { padding: '12px 28px', fontSize: 15, borderRadius: 12 },
    lg: { padding: '15px 36px', fontSize: 16, borderRadius: 14 },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            loadingVariant = 'spinner',
            loadingText,
            leftIcon,
            rightIcon,
            fullWidth = false,
            children,
            disabled,
            style,
            ...rest
        },
        ref,
    ) => {
        const isDisabled = disabled || loading;

        // Choose loader component based on variant
        const LoaderComponent =
            loadingVariant === 'dots' ? DotsLoader :
                loadingVariant === 'pulse' ? PulseLoader :
                    Spinner;

        return (
            <button
                ref={ref}
                className={variant === 'primary' ? 'btn-primary' : 'btn-ghost'}
                disabled={isDisabled}
                aria-busy={loading}
                style={{
                    ...sizeStyles[size],
                    width: fullWidth ? '100%' : undefined,
                    ...style,
                }}
                {...rest}
            >
                {/* Left icon — hidden while loading */}
                {!loading && leftIcon && (
                    <span aria-hidden="true" style={{ flexShrink: 0, display: 'flex' }}>
                        {leftIcon}
                    </span>
                )}

                {/* Loader — shown while loading */}
                {loading && <LoaderComponent />}

                {/* Label */}
                <span>
                    {loading && loadingText ? loadingText : children}
                </span>

                {/* Right icon — hidden while loading */}
                {!loading && rightIcon && (
                    <span aria-hidden="true" style={{ flexShrink: 0, display: 'flex' }}>
                        {rightIcon}
                    </span>
                )}
            </button>
        );
    },
);

Button.displayName = 'Button';
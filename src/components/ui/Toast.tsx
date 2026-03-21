'use client';

import { Toaster, toast as sonnerToast } from 'sonner';

// ── Toaster — mount once in root layout ──────────────────────
export function AppToaster() {
    return (
        <Toaster
            position="top-right"
            gap={10}
            toastOptions={{
                // Base styles applied to every toast
                style: {
                    background: 'rgba(18, 18, 36, 0.92)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: 12,
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 14,
                    fontWeight: 400,
                    padding: '14px 16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
                    minWidth: 320,
                    maxWidth: 420,
                },
            }}
        />
    );
}

// ── Icon components ───────────────────────────────────────────

function HappyFace() {
    return (
        <svg
            width="20" height="20" viewBox="0 0 24 24"
            fill="none"
            style={{ flexShrink: 0 }}
        >
            <circle cx="12" cy="12" r="10" stroke="var(--color-success)" strokeWidth="1.5" />
            <path
                d="M8 13.5C8.5 15.5 11 17 12 17C13 17 15.5 15.5 16 13.5"
                stroke="var(--color-success)" strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle cx="9" cy="10" r="1" fill="var(--color-success)" />
            <circle cx="15" cy="10" r="1" fill="var(--color-success)" />
        </svg>
    );
}

function SadFace() {
    return (
        <svg
            width="20" height="20" viewBox="0 0 24 24"
            fill="none"
            style={{ flexShrink: 0 }}
        >
            <circle cx="12" cy="12" r="10" stroke="var(--color-error)" strokeWidth="1.5" />
            <path
                d="M8 16C8.5 14 11 12.5 12 12.5C13 12.5 15.5 14 16 16"
                stroke="var(--color-error)" strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle cx="9" cy="10" r="1" fill="var(--color-error)" />
            <circle cx="15" cy="10" r="1" fill="var(--color-error)" />
        </svg>
    );
}

function InfoFace() {
    return (
        <svg
            width="20" height="20" viewBox="0 0 24 24"
            fill="none"
            style={{ flexShrink: 0 }}
        >
            <circle cx="12" cy="12" r="10" stroke="#60a5fa" strokeWidth="1.5" />
            <path
                d="M9.5 12C10 11 11 10.5 12 10.5C13 10.5 14 11 14.5 12"
                stroke="#60a5fa" strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle cx="9" cy="9.5" r="1" fill="#60a5fa" />
            <circle cx="15" cy="9.5" r="1" fill="#60a5fa" />
        </svg>
    );
}

function WarningFace() {
    return (
        <svg
            width="20" height="20" viewBox="0 0 24 24"
            fill="none"
            style={{ flexShrink: 0 }}
        >
            <circle cx="12" cy="12" r="10" stroke="var(--color-warning)" strokeWidth="1.5" />
            <path
                d="M9 13C9.5 12 11 11 12 11C13 11 14.5 12 15 13"
                stroke="var(--color-warning)" strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle cx="9" cy="9.5" r="1" fill="var(--color-warning)" />
            <circle cx="15" cy="9.5" r="1" fill="var(--color-warning)" />
        </svg>
    );
}

// Close button rendered inside each toast
function CloseButton({ toastId }: { toastId: string | number }) {
    return (
        <button
            onClick={() => sonnerToast.dismiss(toastId)}
            aria-label="Close notification"
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                flexShrink: 0,
                transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--color-text-primary)')
            }
            onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'var(--color-text-muted)')
            }
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
            >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button>
    );
}

// ── Toast content layout ──────────────────────────────────────

function ToastContent({
    icon,
    title,
    description,
    id,
    accentColor,
}: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    id: string | number;
    accentColor: string;
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                width: '100%',
            }}
        >
            {/* Left accent bar */}
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    background: accentColor,
                    borderRadius: '12px 0 0 12px',
                }}
            />

            {/* Icon */}
            <div style={{ marginTop: 1 }}>{icon}</div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: 'var(--color-text-primary)',
                        lineHeight: 1.3,
                        marginBottom: description ? 3 : 0,
                    }}
                >
                    {title}
                </div>
                {description && (
                    <div
                        style={{
                            fontSize: 13,
                            color: 'var(--color-text-secondary)',
                            lineHeight: 1.4,
                        }}
                    >
                        {description}
                    </div>
                )}
            </div>

            {/* Close */}
            <CloseButton toastId={id} />
        </div>
    );
}

// ── Public toast API ──────────────────────────────────────────
// Usage:
//   toast.success('Account created', { description: 'Check your email' })
//   toast.error('Login failed', { description: 'Invalid credentials' })

interface ToastOptions {
    description?: string;
    duration?: number; // ms — default 4000
}

export const toast = {
    success: (title: string, options: ToastOptions = {}) =>
        sonnerToast.custom(
            (id) => (
                <ToastContent
                    id={id}
                    icon={<HappyFace />}
                    title={title}
                    description={options.description}
                    accentColor="var(--color-success)"
                />
            ),
            { duration: options.duration ?? 4000 },
        ),

    error: (title: string, options: ToastOptions = {}) =>
        sonnerToast.custom(
            (id) => (
                <ToastContent
                    id={id}
                    icon={<SadFace />}
                    title={title}
                    description={options.description}
                    accentColor="var(--color-error)"
                />
            ),
            { duration: options.duration ?? 5000 },
        ),

    info: (title: string, options: ToastOptions = {}) =>
        sonnerToast.custom(
            (id) => (
                <ToastContent
                    id={id}
                    icon={<InfoFace />}
                    title={title}
                    description={options.description}
                    accentColor="#60a5fa"
                />
            ),
            { duration: options.duration ?? 4000 },
        ),

    warning: (title: string, options: ToastOptions = {}) =>
        sonnerToast.custom(
            (id) => (
                <ToastContent
                    id={id}
                    icon={<WarningFace />}
                    title={title}
                    description={options.description}
                    accentColor="var(--color-warning)"
                />
            ),
            { duration: options.duration ?? 4500 },
        ),
};
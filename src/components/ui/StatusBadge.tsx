// Displays verification status — used on dashboard and step indicators
type BadgeStatus = 'verified' | 'pending' | 'failed' | 'unverified';

interface StatusBadgeProps {
    status: BadgeStatus;
    label?: string;
    // pulse = animated glow — use for active/verified states
    pulse?: boolean;
}

const statusConfig: Record<
    BadgeStatus,
    { color: string; bg: string; border: string; defaultLabel: string; icon: string }
> = {
    verified: {
        color: 'var(--color-success)',
            bg: 'var(--color-success-subtle)',
                border: 'var(--color-success-border)',
                    defaultLabel: 'Verified',
                        icon: '✓',
  },
    pending: {
        color: 'var(--color-warning)',
            bg: 'var(--color-warning-subtle)',
                border: 'rgba(245,158,11,0.30)',
                    defaultLabel: 'Pending',
                        icon: '◷',
  },
    failed: {
        color: 'var(--color-error)',
            bg: 'var(--color-error-subtle)',
                border: 'var(--color-error-border)',
                    defaultLabel: 'Failed',
                        icon: '✕',
  },
    unverified: {
        color: 'var(--color-text-muted)',
            bg: 'rgba(255,255,255,0.05)',
                border: 'rgba(255,255,255,0.10)',
                    defaultLabel: 'Not verified',
                        icon: '○',
  },
};

export function StatusBadge({ status, label, pulse = false }: StatusBadgeProps) {
    const cfg = statusConfig[status];

    return (
        <span
            className={pulse && status === 'verified' ? 'glow-success' : ''}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 999,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.color,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
            }}
        >
            <span style={{ fontSize: 11 }}>{cfg.icon}</span>
            {label ?? cfg.defaultLabel}
        </span>
    );
}
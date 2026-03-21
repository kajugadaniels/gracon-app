'use client';

// Visual password strength indicator
// Shows 4 bars that fill up as password gets stronger
interface PasswordStrengthProps {
    password: string;
}

interface StrengthResult {
    score: 0 | 1 | 2 | 3 | 4;
    label: string;
    color: string;
}

function getStrength(password: string): StrengthResult {
    if (!password) return { score: 0, label: '', color: 'transparent' };

    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&^#]/.test(password)) score++;

    // Clamp to 4 levels
    const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

    const map: Record<
        1 | 2 | 3 | 4,
        { label: string; color: string }
    > = {
        1: { label: 'Weak',   color: 'var(--color-error)'   },
        2: { label: 'Fair',   color: 'var(--color-warning)'  },
        3: { label: 'Good',   color: '#7c3aed'               },
        4: { label: 'Strong', color: 'var(--color-success)'  },
    };

    return clamped === 0
        ? { score: 0, label: '', color: 'transparent' }
        : { score: clamped, ...map[clamped] };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const { score, label, color } = getStrength(password);

    if (!password) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {/* Four strength bars */}
            <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4].map((level) => (
                    <div
                        key={level}
                        style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            background: level <= score ? color : 'rgba(91,35,255,0.10)',
                            transition: 'background 280ms ease',
                        }}
                    />
                ))}
            </div>

            {/* Label */}
            {label && (
                <span
                    className="animate-fade-in"
                    style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color,
                        transition: 'color 280ms ease',
                    }}
                >
                    {label} password
                </span>
            )}
        </div>
    );
}

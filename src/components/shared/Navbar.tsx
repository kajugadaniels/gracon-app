'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { logoutApi } from '@/api/auth/logout.api';
import { Button } from '@/components/ui';

// Shared navbar — rendered on all protected pages
// Shows user name + logout button
export function Navbar() {
    const router = useRouter();
    const { user, refreshToken, clearAuth } = useAuthStore();

    const handleLogout = async () => {
        try {
            if (refreshToken) {
                await logoutApi(refreshToken);
            }
        } catch {
            // Logout always succeeds client-side even if server call fails
        } finally {
            // Clear session cookie
            document.cookie =
                'session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            clearAuth();
            router.push('/login');
        }
    };

    return (
        <nav
            className="glass"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                padding: '0 32px',
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderRadius: 0,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            {/* Brand */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                }}
                onClick={() => router.push('/dashboard')}
            >
                {/* Logo mark */}
                <span
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        fontWeight: 700,
                        color: '#fff',
                        boxShadow: '0 2px 8px var(--color-primary-glow)',
                    }}
                >
                    ID
                </span>
                <span
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        letterSpacing: '-0.01em',
                    }}
                >
                    Verify
                </span>
            </div>

            {/* Right side — user info + logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {user && (
                    <span
                        style={{
                            fontSize: 13,
                            color: 'var(--color-text-secondary)',
                            fontWeight: 500,
                        }}
                    >
                        {user.postNames} {user.surName}
                    </span>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                >
                    Log out
                </Button>
            </div>
        </nav>
    );
}
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';
import { logoutApi } from '@/api/auth/logout.api';
import { Button } from '@/components/ui';

// Shared navbar — rendered on all protected pages.
// Desktop: inline nav links between brand and user controls.
// Mobile (<768px): hamburger toggle reveals the same links in a dropdown.

const NAV_LINKS = [
  { href: '/dashboard',          label: 'Dashboard',         icon: '🏠' },
  { href: '/profile/signature',  label: 'Digital Signature', icon: '📜' },
  { href: '/profile/signing',    label: 'Sign Documents',    icon: '✍️'  },
  { href: '/profile',    label: 'Profile',           icon: '👤'  },
];

export function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, refreshToken, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (refreshToken) await logoutApi(refreshToken);
    } catch {
      // Logout always succeeds client-side even if the server call fails
    } finally {
      document.cookie =
        'session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      clearAuth();
      router.push('/login');
    }
  };

  return (
    <>
      <nav
        className="glass"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderRadius: 0,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          gap: 16,
        }}
      >
        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => router.push('/dashboard')}
        >
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
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
            Verify
          </span>
        </div>

        {/* ── Desktop nav links ──────────────────────────────────────────── */}
        <div
          className="desktop-nav"
          style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}
        >
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  background: active ? 'rgba(91,35,255,0.12)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s',
                  // Minimum 44px touch target height
                  minHeight: 44,
                }}
              >
                <span style={{ fontSize: 15 }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>

        {/* ── Right: user info + logout + hamburger ─────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {user && (
            <span
              className="user-name"
              style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}
            >
              {user.postNames} {user.surName}
            </span>
          )}

          <Button variant="ghost" size="sm" onClick={handleLogout} className="logout-btn">
            Log out
          </Button>

          {/* Hamburger — visible only below 768px */}
          <button
            className="hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              display: 'none', // overridden in <style> below
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              color: 'var(--color-text-primary)',
              minWidth: 44,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown menu ─────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="mobile-menu glass"
          style={{
            position: 'sticky',
            top: 64,
            zIndex: 99,
            borderRadius: 0,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  background: active ? 'rgba(91,35,255,0.12)' : 'transparent',
                  textDecoration: 'none',
                  minHeight: 44,
                }}
              >
                <span style={{ fontSize: 18 }}>{icon}</span>
                {label}
              </Link>
            );
          })}

          {user && (
            <div
              style={{
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--color-text-secondary)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                marginTop: 4,
              }}
            >
              {user.postNames} {user.surName}
            </div>
          )}
        </div>
      )}

      {/* ── Responsive overrides ──────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 767px) {
          .desktop-nav   { display: none !important; }
          .user-name     { display: none !important; }
          .logout-btn    { display: none !important; }
          .hamburger     { display: flex !important; }
          .mobile-menu   { display: flex !important; }
        }
        @media (min-width: 768px) {
          .hamburger     { display: none !important; }
          .mobile-menu   { display: none !important; }
        }
      `}</style>
    </>
  );
}

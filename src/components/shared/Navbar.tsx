'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth.store';
import { Button } from '@/components/ui';
import { NAV_LINKS } from '@/constants/nav';
import styles from './Navbar.module.css';

export function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, refreshToken, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Logout always succeeds client-side even if the server call fails
    } finally {
      clearAuth();
      window.location.replace('/login');
    }
  };

  return (
    <>
      <nav
        className={`glass ${styles.nav}`}
      >
        {/* ── Brand ─────────────────────────────────────────────────────── */}
        <div
          className={styles.brand}
          onClick={() => router.push('/dashboard')}
        >
          <span className={styles.brandMark}>
            ID
          </span>
          <span className={styles.brandName}>
            Verify
          </span>
        </div>

        {/* ── Desktop nav links ──────────────────────────────────────────── */}
        <div className={styles.desktopNav}>
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              >
                <span className={styles.navIcon}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>

        {/* ── Right: user info + logout + hamburger ─────────────────────── */}
        <div className={styles.rightActions}>
          {user && (
            <span
              className={styles.userName}
            >
              {user.postNames} {user.surName}
            </span>
          )}

          <Button variant="ghost" size="sm" onClick={handleLogout} className={styles.logoutButton}>
            Log out
          </Button>

          {/* Hamburger — visible only below 768px */}
          <button
            className={styles.hamburger}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown menu ─────────────────────────────────────────── */}
      {menuOpen && (
        <div
          className={`glass ${styles.mobileMenu}`}
        >
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ''}`}
              >
                <span className={styles.mobileIcon}>{icon}</span>
                {label}
              </Link>
            );
          })}

          {user && (
            <div className={styles.mobileUser}>
              {user.postNames} {user.surName}
            </div>
          )}
        </div>
      )}
    </>
  );
}

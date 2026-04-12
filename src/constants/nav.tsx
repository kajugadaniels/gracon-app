/**
 * Shared navigation constants for the sidebar and navbar.
 * NAV_ITEMS drives AppSidebar (SVG icon components, exact/external flags).
 * NAV_LINKS drives Navbar (emoji icons, simple href + label).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** A single sidebar navigation entry. */
export interface NavItem {
    href: string;
    label: string;
    /** React component that renders the SVG icon. */
    Icon: () => React.ReactElement;
    /** When true, only highlight this item on an exact pathname match. */
    exact: boolean;
    /** When true, opens in a new tab and is never marked active. */
    external: boolean;
}

/** A single navbar navigation link (emoji icon variant). */
export interface NavLink {
    href: string;
    label: string;
    icon: string;
}

// ─── Sidebar icons ────────────────────────────────────────────────────────────

function IconDashboard() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
    );
}

function IconProfile() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    );
}

function IconSignature() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

function IconDocument() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

// ─── NAV_ITEMS — sidebar ──────────────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
    { href: '/dashboard',         label: 'Dashboard',         Icon: IconDashboard, exact: true,  external: false },
    { href: '/profile',           label: 'Profile',           Icon: IconProfile,   exact: true,  external: false },
    { href: '/profile/signature', label: 'Digital Signature', Icon: IconSignature, exact: false, external: false },
    {
        href: process.env.NEXT_PUBLIC_DOCS_URL ?? 'http://localhost:4002/documents',
        label: 'Documents',
        Icon: IconDocument,
        exact: false,
        external: true,
    },
];

// ─── NAV_LINKS — navbar ───────────────────────────────────────────────────────

export const NAV_LINKS: NavLink[] = [
    { href: '/dashboard',         label: 'Dashboard',         icon: '🏠' },
    { href: '/profile/signature', label: 'Digital Signature', icon: '📜' },
    { href: '/profile',           label: 'Profile',           icon: '👤' },
];

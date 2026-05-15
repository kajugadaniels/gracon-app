/**
 * Shared product navigation for the protected app shell.
 * Items marked as `comingSoon` should never navigate; the topbar shows a toast.
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
    /** When true, show a non-blocking unavailable message instead of navigating. */
    comingSoon?: boolean;
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

function IconSpreadsheet() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 10h18M9 4v16M15 4v16" />
        </svg>
    );
}

function IconLand() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 18 9 7l5 11 3-7 3 7" />
            <path d="M3 18h18" />
            <circle cx="9" cy="7" r="2" />
        </svg>
    );
}

function IconBanking() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10h18L12 4 3 10Z" />
            <path d="M5 10v8M9 10v8M15 10v8M19 10v8M4 18h16M3 21h18" />
        </svg>
    );
}

function IconTasks() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 6h11M9 12h11M9 18h11" />
            <path d="m4 6 1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />
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
    { href: '/spreadsheet', label: 'Spreadsheet', Icon: IconSpreadsheet, exact: false, external: false, comingSoon: true },
    { href: '/land', label: 'Land', Icon: IconLand, exact: false, external: false, comingSoon: true },
    { href: '/banking', label: 'Banking', Icon: IconBanking, exact: false, external: false, comingSoon: true },
    { href: '/tasks', label: 'Task Management', Icon: IconTasks, exact: false, external: false, comingSoon: true },
];

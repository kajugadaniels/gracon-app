// Layout for authenticated pages — dashboard, verify-identity
// Includes navbar — all children are wrapped with it

import { Navbar } from "@/components/shared";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '32px 24px' }}>
                {children}
            </main>
        </div>
    );
}
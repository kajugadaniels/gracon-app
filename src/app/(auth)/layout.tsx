// Layout for unauthenticated pages — login, register, verify-email
// Centered single-column layout — no navbar or sidebar
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main
            style={{
                minHeight: '100dvh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 16px',
            }}
        >
            {children}
        </main>
    );
}
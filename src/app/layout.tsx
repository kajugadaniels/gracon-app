import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { AppToaster } from '@/components/ui';
import { AuthProvider } from '@/components/shared';
import './globals.css';

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-dm-sans',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'Gracon 360',
        template: '%s | Gracon 360',
    },
    description: 'Secure identity and digital trust infrastructure for Gracon 360.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={dmSans.variable}>
            <body className="font-sans antialiased" suppressHydrationWarning>
                {/*
          AuthProvider restores tokens from sessionStorage into the
          Zustand store on every page load/refresh.
          Must wrap everything so tokens are available before any
          child component fires an authenticated API call.
        */}
                <AuthProvider>
                    <AppToaster />
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}

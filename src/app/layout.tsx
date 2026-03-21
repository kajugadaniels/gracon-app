import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-dm-sans',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'ID Verification Platform',
    description: 'Secure identity verification powered by AI',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={dmSans.variable}>
            <body className="font-sans antialiased">
                {children}
            </body>
        </html>
    );
}
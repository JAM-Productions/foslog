import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Foslog - Your Media Review Journal',
    description:
        'Review and track films, series, books, games, and music. Discover new favorites and share your thoughts.',
    keywords: [
        'reviews',
        'films',
        'books',
        'games',
        'music',
        'series',
        'media',
        'tracking',
    ],
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: '48x48' },
            { url: '/favicon.svg', type: 'image/svg+xml' },
        ],
        shortcut: '/favicon.ico',
        apple: '/apple-icon.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
        >
            <head>
                <meta
                    name="apple-mobile-web-app-title"
                    content="Foslog"
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} bg-background min-h-screen antialiased`}
            >
                <ThemeProvider>
                    <Header />
                    <main className="flex-1">{children}</main>
                </ThemeProvider>
            </body>
        </html>
    );
}

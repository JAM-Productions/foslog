import type { Metadata } from 'next';
import { Ubuntu_Mono } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ThemeScript } from '@/components/theme/theme-script';
import { AuthProvider } from '@/lib/auth/auth-provider';
import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { ToastProvider } from '@/components/toast/toast-provider';
import DynamicModalWrapper from '@/components/modal/dynamic-modal-wrapper';

const font = Ubuntu_Mono({
    weight: ['400', '700'],
    subsets: ['latin'],
    display: 'swap',
});

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    return {
        title: t('title'),
        description: t('description'),
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
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // Ensure that the incoming `locale` is valid
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    return (
        <html
            lang={locale}
            suppressHydrationWarning
        >
            <head>
                <ThemeScript />
                <meta
                    name="apple-mobile-web-app-title"
                    content="Foslog"
                />
            </head>
            <body
                className={`${font.className} bg-background flex min-h-screen flex-col antialiased`}
            >
                <NextIntlClientProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            <ToastProvider>
                                <Header />
                                <main className="flex-1">{children}</main>
                                <Footer />
                                <DynamicModalWrapper />
                            </ToastProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

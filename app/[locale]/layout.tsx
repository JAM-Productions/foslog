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
import DynamicModalWrapper from '@/components/modal/dynamic-modal-wrapper';
import { ToastProvider } from '@/components/toast/toast-provider';
import { WebVitals } from '@/lib/axiom/client';

const font = Ubuntu_Mono({
    weight: ['400', '700'],
    subsets: ['latin'],
    display: 'swap',
});

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

    const t = await getTranslations({ locale, namespace: 'Metadata' });

    // Enable static rendering
    setRequestLocale(locale);

    return (
        <html
            lang={locale}
            suppressHydrationWarning
        >
            <WebVitals />
            <head>
                <ThemeScript />
                <title>{t('title')}</title>
                <meta
                    name="author"
                    content="JAM Productions"
                />
                <meta
                    name="description"
                    content={t('description')}
                />
                <meta
                    name="keywords"
                    content="reviews, films, series, games, books, music, media"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link
                    rel="icon"
                    href="/favicon.ico"
                    sizes="48x48"
                />
                <link
                    rel="icon"
                    href="/favicon.svg"
                    type="image/svg+xml"
                />
                <link
                    rel="shortcut icon"
                    href="/favicon.ico"
                />
                <link
                    rel="apple-touch-icon"
                    href="/apple-icon.png"
                />
            </head>
            <body
                className={`${font.className} bg-background flex min-h-screen flex-col antialiased`}
            >
                <NextIntlClientProvider>
                    <ThemeProvider>
                        <AuthProvider>
                            <Header />
                            <main className="flex-1">{children}</main>
                            <Footer />
                            <DynamicModalWrapper />
                            <ToastProvider />
                        </AuthProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

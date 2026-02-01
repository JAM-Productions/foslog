import { Metadata } from 'next';
import LoginClient from './login-client';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: 'Metadata.LoginPage',
    });

    return {
        title: t('title'),
        description: t('description'),
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default function LoginPage() {
    return <LoginClient />;
}

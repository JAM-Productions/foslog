import { Metadata } from 'next';
import RegisterClient from './signup-client';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: 'Metadata.SignupPage',
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

export default function RegisterPage() {
    return <RegisterClient />;
}

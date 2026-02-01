import LegalDocument from '@/components/legal/legal-document';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({
        locale,
        namespace: 'Metadata.TermsOfServicePage',
    });

    return {
        title: t('title'),
        description: t('description'),
    };
}

export default async function TermsOfServicePage({
    params: paramsPromise,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await paramsPromise;
    return (
        <LegalDocument
            docName="terms-of-service.md"
            locale={locale}
        />
    );
}

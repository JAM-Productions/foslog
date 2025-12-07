import LegalDocument from '@/components/legal/legal-document';

export default async function TermsOfServicePage({
    params: paramsPromise,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await paramsPromise;
    return <LegalDocument docName="terms-of-service.md" locale={locale} />;
}

import LegalDocument from '@/components/legal/legal-document';

export default async function PrivacyPolicyPage({
    params: paramsPromise,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await paramsPromise;
    return <LegalDocument docName="privacy-policy.md" locale={locale} />;
}

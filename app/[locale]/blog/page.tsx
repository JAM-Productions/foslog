import LegalDocument from '@/components/legal/legal-document';

export default async function BlogPage({
    params: paramsPromise,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await paramsPromise;
    return (
        <LegalDocument
            docName="blog.md"
            locale={locale}
        />
    );
}

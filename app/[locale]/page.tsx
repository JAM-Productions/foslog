import HomePageClient from './home-page-client';

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedSearchParams = await searchParams;
    const page = Array.isArray(resolvedSearchParams.page)
        ? resolvedSearchParams.page[0]
        : resolvedSearchParams.page;

    return <HomePageClient searchParams={{ page }} />;
}

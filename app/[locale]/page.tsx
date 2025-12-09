import HomePageClient from './home-page-client';

export default function HomePage({
    searchParams,
}: {
    searchParams: { page?: string };
}) {
    return <HomePageClient searchParams={searchParams} />;
}

import HomePageClient from './home-page-client';

export default function HomePage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // The page param can be a string or an array of strings. We only want the first one if it's an array.
    const page = Array.isArray(searchParams.page)
        ? searchParams.page[0]
        : searchParams.page;

    return <HomePageClient searchParams={{ page }} />;
}

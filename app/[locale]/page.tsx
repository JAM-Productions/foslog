import { getMedias } from '@/app/actions/media';
import HomePageClient from './home-page-client';

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const { items, total } = await getMedias(page);

    return (
        <HomePageClient
            mediaItems={items}
            total={total}
            currentPage={page}
            pageSize={12}
        />
    );
}

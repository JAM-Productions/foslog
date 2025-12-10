import { getMedias } from '@/app/actions/media';
import HomePageClient from './home-page-client';

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; type?: string; search?: string }>;
}) {
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const mediaType = params.type || 'all';
    const searchQuery = params.search || '';
    const { items, total } = await getMedias(page, 12, mediaType, searchQuery);

    return (
        <HomePageClient
            mediaItems={items}
            total={total}
            currentPage={page}
            pageSize={12}
        />
    );
}

import { getMediaById } from '@/app/actions/media';
import { MediaClient } from './media-client';

export default async function MediaPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page: string | undefined }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const parsedPage = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page, 10) : 1;
    const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
    const mediaItem = await getMediaById(resolvedParams.id, page);

    if (!mediaItem) {
        return <div>Media not found</div>;
    }

    return <MediaClient mediaItem={mediaItem} />;
}

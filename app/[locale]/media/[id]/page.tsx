import { getMediaById } from '@/app/actions/media';
import { MediaClient } from './media-client';

export default async function MediaPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: { page: string | undefined };
}) {
    const resolvedParams = await params;
    const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
    const mediaItem = await getMediaById(resolvedParams.id, page);

    if (!mediaItem) {
        return <div>Media not found</div>;
    }

    return <MediaClient mediaItem={mediaItem} />;
}

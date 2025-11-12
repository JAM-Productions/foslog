import { getMediaById } from '@/app/actions/media';
import { MediaClient } from './media-client';

export default async function MediaPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const mediaItem = await getMediaById(resolvedParams.id);

    if (!mediaItem) {
        return <div>Media not found</div>;
    }

    return <MediaClient mediaItem={mediaItem} />;
}

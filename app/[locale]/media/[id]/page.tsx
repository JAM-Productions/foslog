import { getMediaById } from '@/app/actions/media';
import { MediaClient } from './media-client';

export default async function MediaPage({
    params,
}: {
    params: { id: string };
}) {
    const mediaItem = await getMediaById(params.id);

    if (!mediaItem) {
        return <div>Media not found</div>;
    }

    return <MediaClient mediaItem={mediaItem} />;
}

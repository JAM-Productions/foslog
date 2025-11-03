import { MediaClient } from '@/app/[locale]/media/[id]/media-client';

export default async function MediaPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;

    return <MediaClient id={resolvedParams.id} />;
}

import { getMediaById } from '@/app/actions/media';
import { MediaClient } from './media-client';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export default async function MediaPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ page: string | undefined }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const parsedPage = resolvedSearchParams.page
        ? parseInt(resolvedSearchParams.page, 10)
        : 1;
    const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
    const mediaItem = await getMediaById(resolvedParams.id, page);

    if (!mediaItem) {
        return <div>Media not found</div>;
    }

    let hasReviewed = false;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session?.user?.id) {
        const count = await prisma.review.count({
            where: {
                mediaId: resolvedParams.id,
                userId: session.user.id,
            },
        });
        hasReviewed = count > 0;
    }

    return (
        <MediaClient
            mediaItem={mediaItem}
            hasReviewed={hasReviewed}
        />
    );
}

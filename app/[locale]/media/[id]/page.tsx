import { getMediaByIdWithReviews, getMediaMetadata } from '@/app/actions/media';
import { MediaClient } from './media-client';
import { hasUserReviewed, hasUserBookmarked } from '@/app/actions/user';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
    const { id, locale } = await params;
    const mediaItem = await getMediaMetadata(id);
    const t = await getTranslations({
        locale,
        namespace: 'Metadata.MediaPage',
    });

    if (!mediaItem) {
        return {
            title: t('mediaNotFound'),
        };
    }

    return {
        title: t('mediaTitle', { title: mediaItem.title }),
        description: t('mediaDescription', { title: mediaItem.title }),
    };
}

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
    const t = await getTranslations('MediaPage');

    let mediaItem: Awaited<ReturnType<typeof getMediaByIdWithReviews>>,
        hasReviewed: Awaited<ReturnType<typeof hasUserReviewed>>,
        hasBookmarked: Awaited<ReturnType<typeof hasUserBookmarked>>;

    try {
        [mediaItem, hasReviewed, hasBookmarked] = await Promise.all([
            getMediaByIdWithReviews(resolvedParams.id, page),
            hasUserReviewed(resolvedParams.id),
            hasUserBookmarked(resolvedParams.id),
        ]);
    } catch (error) {
        console.error(
            `[MediaPage] Failed to load media for id: ${resolvedParams.id}`,
            error
        );

        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-500">{t('loadError')}</div>
            </div>
        );
    }

    if (!mediaItem) {
        notFound();
    }

    return (
        <MediaClient
            mediaItem={mediaItem}
            hasReviewed={hasReviewed}
            hasBookmarked={hasBookmarked}
        />
    );
}

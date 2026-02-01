import { getMediaById, getMediaMetadata } from '@/app/actions/media';
import { MediaClient } from './media-client';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
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
    const mediaItem = await getMediaById(resolvedParams.id, page);

    if (!mediaItem) {
        notFound();
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

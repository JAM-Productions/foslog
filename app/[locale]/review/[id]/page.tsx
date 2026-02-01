import * as React from 'react';
import { ReviewClient } from './review-client';
import { getReviewById, getReviewMetadata } from '@/app/actions/review';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string; locale: string }>;
}): Promise<Metadata> {
    const { id, locale } = await params;
    const reviewItem = await getReviewMetadata(id);
    const t = await getTranslations({
        locale,
        namespace: 'Metadata.ReviewPage',
    });

    if (!reviewItem) {
        return {
            title: t('reviewNotFound'),
        };
    }

    return {
        title: t('reviewTitle', {
            userName: reviewItem.userName,
            mediaTitle: reviewItem.mediaTitle,
        }),
        description: t('reviewDescription', {
            userName: reviewItem.userName,
            mediaTitle: reviewItem.mediaTitle,
        }),
    };
}

export default async function ReviewPage({
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
    const reviewItem = await getReviewById(resolvedParams.id, page);

    if (!reviewItem) {
        notFound();
    }

    return <ReviewClient reviewItem={reviewItem} />;
}

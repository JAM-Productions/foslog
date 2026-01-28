import * as React from 'react';
import { ReviewClient } from './review-client';
import { getReviewById } from '@/app/actions/review';
import { notFound } from 'next/navigation';

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

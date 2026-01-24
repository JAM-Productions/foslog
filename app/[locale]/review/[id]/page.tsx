import * as React from 'react';
import { ReviewClient } from './review-client';
import { getReviewById } from '@/app/actions/review';
import { notFound } from 'next/navigation';

export default async function ReviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const reviewItem = await getReviewById(resolvedParams.id);

    if (!reviewItem) {
        notFound();
    }

    return <ReviewClient reviewItem={reviewItem} />;
}

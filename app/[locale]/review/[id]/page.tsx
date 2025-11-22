import * as React from 'react';
import { ReviewClient } from './review-client';
import { getReviewById } from '@/app/actions/review';

export default async function ReviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const reviewItem = await getReviewById(resolvedParams.id);

    if (!reviewItem) {
        return <div>Review not found</div>;
    }

    return <ReviewClient reviewItem={reviewItem} />;
}

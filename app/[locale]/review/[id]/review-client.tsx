'use client';

import { BackButton } from '@/components/button/back-button';
import { SafeReviewWithMedia } from '@/lib/types';
import { MediaContext } from '@/components/media/media-context';
import { ReviewDetailCard } from '@/components/review/review-detail-card';
import { useTranslations } from 'next-intl';

export function ReviewClient({
    reviewItem,
}: {
    reviewItem: SafeReviewWithMedia;
}) {
    const { media } = reviewItem;

    const t = useTranslations('ReviewPage');

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8">
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <BackButton href={`/media/${media.id}`} />
                </div>

                <div className="mb-6 sm:mb-8">
                    <MediaContext media={media} />
                </div>

                <div className="mb-8 flex flex-col sm:mb-12 lg:mb-16">
                    <span className="text-foreground mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl">
                        {t('review')}
                    </span>
                    <ReviewDetailCard review={reviewItem} />
                </div>
            </div>
        </div>
    );
}

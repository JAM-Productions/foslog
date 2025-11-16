'use client';

import { MediaDetails } from '@/components/media/media-details';
import { ReviewForm } from '@/components/review/review-form';
import { ReviewList } from '@/components/review/review-list';
import { BackButton } from '@/components/button/back-button';
import { useTranslations } from 'next-intl';
import { SafeMediaItemWithReviews } from '@/lib/types';

interface MediaClientProps {
    mediaItem: SafeMediaItemWithReviews;
}

export function MediaClient({ mediaItem }: MediaClientProps) {
    const t = useTranslations('MediaPage');
    const { reviews, ...media } = mediaItem;

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8">
                {/* Header with Back Button */}
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <BackButton />
                </div>

                {/* Media Details Section */}
                <div className="mb-8 sm:mb-12 lg:mb-16">
                    <MediaDetails media={media} />
                </div>

                {/* Reviews Section */}
                <div className="mb-8 sm:mb-12 lg:mb-16">
                    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-foreground text-2xl font-bold sm:text-3xl">
                            {t('reviews')}
                            <span className="text-muted-foreground ml-2 text-base font-normal sm:ml-3 sm:text-lg">
                                ({reviews.length})
                            </span>
                        </h2>
                    </div>
                    {reviews.length > 0 ? (
                        <ReviewList reviews={reviews} />
                    ) : (
                        <div className="bg-card border-border rounded-lg border py-6 text-center sm:py-8">
                            <p className="text-muted-foreground text-sm sm:text-base">
                                {t('noReviews')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Review Form Section */}
                <div className="mb-8 sm:mb-12 lg:mb-16">
                    <h2 className="text-foreground mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl">
                        {t('leaveReview')}
                    </h2>
                    <div className="bg-card border-border rounded-lg border p-4 sm:p-6 lg:p-8">
                        <ReviewForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

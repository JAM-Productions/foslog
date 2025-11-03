'use client';

import { use } from 'react';
import { MediaDetails } from '@/components/media-details';
import { ReviewForm } from '@/components/review-form';
import { ReviewList } from '@/components/review-list';
import { mockMediaItems, mockReviews } from '@/lib/mock-data';
import { BackButton } from '@/components/ui/back-button';

import { useTranslations } from 'next-intl';

// ... (imports)

export default function MediaPage({ params }: { params: { id: string } }) {
    const t = useTranslations('MediaPage');
    const { id } = use(params);
    const media = mockMediaItems.find((item) => item.id === id);
    const reviews = mockReviews.filter((review) => review.mediaId === id);

    if (!media) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex items-center gap-4">
                    <BackButton />
                </div>
                <div className="py-12 text-center">
                    <h1 className="text-foreground text-2xl font-bold">
                        {t('mediaNotFound')}
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 py-6">
                {/* Header with Back Button */}
                <div className="mb-6">
                    <BackButton />
                </div>

                {/* Media Details Section */}
                <div className="mb-12">
                    <MediaDetails media={media} />
                </div>

                {/* Reviews Section */}
                <div className="mb-12">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-foreground text-3xl font-bold">
                            {t('reviews')}
                            <span className="text-muted-foreground ml-3 text-lg font-normal">
                                ({reviews.length})
                            </span>
                        </h2>
                    </div>
                    {reviews.length > 0 ? (
                        <ReviewList reviews={reviews} />
                    ) : (
                        <div className="bg-card border-border rounded-lg border py-8 text-center">
                            <p className="text-muted-foreground">
                                {t('noReviews')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Review Form Section */}
                <div className="mb-12">
                    <h2 className="text-foreground mb-6 text-3xl font-bold">
                        {t('leaveReview')}
                    </h2>
                    <div className="bg-card border-border rounded-lg border p-6">
                        <ReviewForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

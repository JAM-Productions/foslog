'use client';

import { MediaDetails } from '@/components/media/media-details';
import { ReviewForm } from '@/components/review/review-form';
import { ReviewList } from '@/components/review/review-list';
import { BackButton } from '@/components/button/back-button';
import { useTranslations } from 'next-intl';
import { SafeMediaItemWithReviews } from '@/lib/types';
import Pagination from '@/components/pagination/pagination';
import { useState } from 'react';
import { Button } from '@/components/button/button';
import { Modal } from '@/components/modal/modal';

interface MediaClientProps {
    mediaItem: SafeMediaItemWithReviews;
}

export function MediaClient({ mediaItem }: MediaClientProps) {
    const t = useTranslations('MediaPage');
    const { reviews, totalPages, currentPage, ...media } = mediaItem;
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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
                                ({media.totalReviews})
                            </span>
                        </h2>
                        <Button
                            variant="default"
                            onClick={() => setIsReviewModalOpen(true)}
                        >
                            {t('leaveReview')}
                        </Button>
                    </div>
                    {reviews.length > 0 ? (
                        <>
                            <ReviewList reviews={reviews} />
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                            />
                        </>
                    ) : (
                        <div className="bg-card border-border rounded-lg border py-6 text-center sm:py-8">
                            <p className="text-muted-foreground text-sm sm:text-base">
                                {t('noReviews')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Review Form Section */}
                <Modal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    title={t('leaveReview')}
                >
                    <ReviewForm
                        mediaId={mediaItem.id}
                        onSuccess={() => setIsReviewModalOpen(false)}
                    />
                </Modal>
            </div>
        </div>
    );
}

'use client';

'use client';

import { BackButton } from '@/components/button/back-button';
import { SafeReviewWithMedia } from '@/lib/types';
import { MediaContext } from '@/components/media/media-context';
import { ReviewDetailCard } from '@/components/review/review-detail-card';
import { ReviewOptions } from '@/components/review/review-options';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/auth-provider';

export function ReviewClient({
    reviewItem,
}: {
    reviewItem: SafeReviewWithMedia;
}) {
    const { media } = reviewItem;

    const { user: currentUser } = useAuth();

    const t = useTranslations('ReviewPage');

    const isOwner = currentUser?.id === reviewItem.userId;

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8">
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <BackButton href={`/media/${media.id}`} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 sm:gap-6">
                    {/* Left Column - Media Context */}
                    <div className="sm:col-span-3">
                        <MediaContext media={media} />
                    </div>

                    {/* Center Column - Review Detail */}
                    <div className="sm:col-span-9 lg:col-span-7">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <span className="text-foreground text-2xl font-bold sm:text-3xl">
                                {t('review')}
                            </span>

                            <ReviewDetailCard review={reviewItem} />

                            {/* Actions below review on sm screens */}
                            <div className="lg:hidden">
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <ReviewOptions
                                        isOwner={isOwner}
                                        variant="mobile"
                                        review={reviewItem}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="hidden lg:col-span-2 lg:block">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <ReviewOptions
                                isOwner={isOwner}
                                variant="desktop"
                                review={reviewItem}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

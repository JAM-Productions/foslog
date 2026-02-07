'use client';

import { BackButton } from '@/components/button/back-button';
import { SafeReviewWithComments, SafeMediaItem } from '@/lib/types';
import { MediaContext } from '@/components/media/media-context';
import { ReviewDetailCard } from '@/components/review/review-detail-card';
import { ReviewOptions } from '@/components/review/review-options';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/auth-provider';
import { ReviewForm } from '@/components/review/review-form';
import { useState } from 'react';
import { CommentForm } from '@/components/comment/comment-form';
import Pagination from '@/components/pagination/pagination';
import { CommentList } from '@/components/comment/comment-list';

export function ReviewClient({
    mediaItem,
    reviewItem,
    userLiked,
}: {
    mediaItem: SafeMediaItem;
    reviewItem: SafeReviewWithComments;
    userLiked: boolean;
}) {
    const { comments } = reviewItem;

    const { user: currentUser } = useAuth();

    const t = useTranslations('ReviewPage');

    const [isEditingReview, setIsEditingReview] = useState(false);

    const isOwner = currentUser?.id === reviewItem.userId;

    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8">
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <BackButton />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-12">
                    {/* Left Column - Media Context */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <MediaContext media={mediaItem} />
                    </div>

                    {/* Center Column - Review Detail */}
                    <div
                        className={`md:col-span-8 ${isEditingReview ? 'lg:col-span-9' : 'lg:col-span-7'}`}
                    >
                        <div className="flex flex-col gap-4 sm:gap-6">
                            <span className="text-foreground text-2xl font-bold sm:text-3xl">
                                {t('review')}
                            </span>
                            {isEditingReview ? (
                                <div className="bg-card border-border rounded-lg border p-4 sm:p-6 lg:p-8">
                                    <ReviewForm
                                        mediaId={mediaItem.id}
                                        mediaType={mediaItem.type}
                                        editProps={{
                                            review: reviewItem,
                                            setIsEditingReview,
                                        }}
                                    />
                                </div>
                            ) : (
                                <ReviewDetailCard
                                    review={reviewItem}
                                    mediaType={mediaItem.type}
                                    userLiked={userLiked}
                                />
                            )}

                            {/* Actions below review on sm screens */}
                            {!isEditingReview && (
                                <div className="lg:hidden">
                                    <div className="flex flex-col gap-4 sm:flex-row">
                                        <ReviewOptions
                                            reviewId={reviewItem.id}
                                            isOwner={isOwner}
                                            variant="mobile"
                                            onEdit={() =>
                                                setIsEditingReview(true)
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                            {/* Comments Section */}
                            <div className="mt-8 mb-8 lg:mb-10">
                                <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                                    <h2 className="text-foreground text-2xl font-bold sm:text-3xl">
                                        {t('comments')}
                                        <span className="text-muted-foreground ml-2 text-base font-normal sm:ml-3 sm:text-lg">
                                            ({reviewItem.totalComments})
                                        </span>
                                    </h2>
                                </div>
                                {comments.length > 0 ? (
                                    <>
                                        <CommentList comments={comments} />
                                        <Pagination
                                            currentPage={reviewItem.currentPage}
                                            totalPages={reviewItem.totalPages}
                                        />
                                    </>
                                ) : (
                                    <div className="bg-card border-border rounded-lg border px-4 py-6 text-center sm:py-8">
                                        <p className="text-muted-foreground text-sm sm:text-base">
                                            {t('noComments')}
                                        </p>
                                    </div>
                                )}
                            </div>
                            {/* Comment Form Section */}
                            <div className="mb-8 sm:mb-12 lg:mb-16">
                                <h2 className="text-foreground mb-4 text-2xl font-bold sm:mb-6 sm:text-3xl">
                                    {t('leaveAComment')}
                                </h2>
                                <div className="bg-card border-border rounded-lg border p-4 sm:p-6 lg:p-8">
                                    <CommentForm reviewId={reviewItem.id} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions */}
                    {!isEditingReview && (
                        <div className="hidden lg:col-span-2 lg:block">
                            <div className="flex flex-col gap-4 sm:gap-6">
                                <ReviewOptions
                                    reviewId={reviewItem.id}
                                    isOwner={isOwner}
                                    variant="desktop"
                                    onEdit={() => setIsEditingReview(true)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

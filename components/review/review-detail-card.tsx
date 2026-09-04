'use client';

import { Card } from '@/components/card';
import { RatingDisplay } from '@/components/input/rating';
import { SafeReview } from '@/lib/types';
import { ConsumedBadge } from '@/components/review/consumed-badge';
import { ConsumedDate } from '@/components/review/consumed-date';
import { RelativeDate } from '@/components/relative-date';
import { toDate } from '@/lib/date';
import { User, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/auth-provider';
import { useRouter } from '@/i18n/navigation';
import { startTransition, useOptimistic, useState } from 'react';
import { useToastStore } from '@/lib/toast-store';

export function ReviewDetailCard({
    review,
    mediaType,
    userLiked,
}: {
    review: SafeReview;
    mediaType?: string;
    userLiked: boolean;
}) {
    const { user } = review;
    const t = useTranslations('MediaPage');
    const tToast = useTranslations('Toast');
    const { showToast } = useToastStore();
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [isLiking, setIsLiking] = useState(false);
    const [optimisticLiked, setOptimisticLiked] = useOptimistic(
        userLiked,
        (prev) => !prev
    );

    const toggleLikeButton = async () => {
        if (!currentUser) {
            return router.push('/login');
        }

        if (isLiking) return;

        setIsLiking(true);

        const method = optimisticLiked ? 'DELETE' : 'POST';

        startTransition(async () => {
            try {
                setOptimisticLiked(optimisticLiked);
                const response = await fetch(`/api/review/${review.id}/like`, {
                    method,
                });

                if (!response.ok) {
                    throw new Error('Toggle like failed');
                }

                router.refresh();
            } catch {
                showToast(tToast('toggleLikeFailed'), 'error');
            } finally {
                setIsLiking(false);
            }
        });
    };

    const isEdited =
        !!review.updatedAt &&
        toDate(review.updatedAt).getTime() !==
            toDate(review.createdAt).getTime();

    return (
        <Card className="p-4 sm:p-6">
            <div className="relative flex flex-row items-center justify-between gap-3">
                <div className="absolute top-0.5 right-0 flex items-center gap-1.5">
                    <button
                        className="cursor-pointer disabled:opacity-70"
                        onClick={() => toggleLikeButton()}
                        disabled={isLiking}
                        type="button"
                        aria-label={t('toggleLike')}
                    >
                        <Heart
                            className={`${optimisticLiked ? 'fill-red-500 text-red-500' : 'text-red-500 hover:fill-red-500'} h-5 w-5 transition-all`}
                        />
                    </button>
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                    <Link
                        href={`/profile/${user.id}`}
                        className="group relative flex-shrink-0"
                    >
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full transition-opacity group-hover:opacity-80"
                                unoptimized
                            />
                        ) : (
                            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full border transition-opacity group-hover:opacity-80">
                                <User className="h-7 w-7" />
                            </div>
                        )}
                    </Link>
                    <div className="min-w-0 flex-1 pr-8">
                        {/* Name and date share a column so the date keeps its
                            own line height, as on the media page cards. */}
                        <div className="flex flex-col pb-1">
                            <Link
                                href={`/profile/${user.id}`}
                                // `self-start` keeps the link as wide as the
                                // name, so the hover only reacts over it.
                                className="max-w-full self-start truncate hover:underline"
                            >
                                <p className="truncate text-base font-bold">
                                    {user.name}
                                </p>
                            </Link>
                            <RelativeDate
                                date={
                                    isEdited
                                        ? review.updatedAt
                                        : review.createdAt
                                }
                                className="text-muted-foreground text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {review.rating !== undefined &&
                                review.rating !== null && (
                                    <RatingDisplay rating={review.rating} />
                                )}
                            {review.liked !== undefined &&
                                review.liked !== null && (
                                    <div className="bg-background flex items-center gap-1.5 rounded-full px-2 py-0.5">
                                        {review.liked ? (
                                            <>
                                                <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                                                <span className="text-xs font-medium text-green-600">
                                                    {t('like')}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <ThumbsDown className="h-3.5 w-3.5 text-red-600" />
                                                <span className="text-xs font-medium text-red-600">
                                                    {t('dislike')}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-3 sm:mt-4">
                <p className="text-base leading-relaxed">{review.review}</p>
                <div className={`${review.review ? 'mt-1' : 'mt-3'} space-y-1`}>
                    <ConsumedDate
                        date={review.consumedDate}
                        mediaType={mediaType}
                        className="text-sm"
                    />
                    {review.consumedMoreThanOnce && (
                        <ConsumedBadge
                            mediaType={mediaType}
                            className="text-sm"
                        />
                    )}
                </div>
            </div>
        </Card>
    );
}

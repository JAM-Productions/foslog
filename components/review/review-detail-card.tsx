'use client';

import { Card } from '@/components/card';
import { RatingDisplay } from '@/components/input/rating';
import { SafeReview } from '@/lib/types';
import { ConsumedBadge } from '@/components/review/consumed-badge';
import { Calendar, User, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/auth-provider';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';

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
    const locale = useLocale();
    const t = useTranslations('MediaPage');
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [isLiking, setIsLiking] = useState(false);
    const [optimisticLiked, setOptimisticLiked] = useState(userLiked);
    const [optimisticTotalLikes, setOptimisticTotalLikes] = useState(
        review.totalLikes
    );

    const toggleLikeButton = async () => {
        if (!currentUser) {
            return router.push('/login');
        }

        if (isLiking) {
            return;
        }

        setIsLiking(true);
        setOptimisticLiked(!userLiked);
        setOptimisticTotalLikes(
            userLiked ? review.totalLikes - 1 : review.totalLikes + 1
        );

        let response;

        try {
            if (userLiked) {
                response = await fetch(`/api/review/${review.id}/like`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    router.refresh();
                }
            } else {
                response = await fetch(`/api/review/${review.id}/like`, {
                    method: 'POST',
                });
                if (response.ok) {
                    router.refresh();
                }
            }
        } finally {
            setTimeout(() => {
                setIsLiking(false);
            }, 1000);
        }
    };

    const formatDate = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isEdited = review.updatedAt && review.updatedAt !== review.createdAt;

    return (
        <Card className="p-4 sm:p-6">
            <div className="relative flex flex-row items-center justify-between gap-3">
                <div className="absolute top-0.5 right-0 flex items-center gap-1.5">
                    <p className="text-muted-foreground text-sm">
                        {optimisticTotalLikes}
                    </p>
                    <button
                        className="cursor-pointer disabled:opacity-50"
                        onClick={() => toggleLikeButton()}
                        disabled={isLiking}
                    >
                        <Heart
                            className={`${optimisticLiked ? 'fill-red-500 text-red-500' : 'text-red-500 hover:fill-red-500'} h-5 w-5 transition-all`}
                        />
                    </button>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link
                        href={`/profile/${user.id}`}
                        className="group relative"
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
                    <div className="flex-1">
                        <div className="flex">
                            <Link
                                href={`/profile/${user.id}`}
                                className="hover:underline"
                            >
                                <p className="text-base font-bold">
                                    {user.name}
                                </p>
                            </Link>
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
            <div className="mt-3 flex flex-col gap-2.5 sm:mt-4">
                <div className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm sm:text-base">
                        {isEdited
                            ? formatDate(review.updatedAt)
                            : formatDate(review.createdAt)}
                    </p>
                </div>
                <div>
                    <p className="text-base leading-relaxed">{review.review}</p>
                    {review.consumedMoreThanOnce && (
                        <ConsumedBadge
                            mediaType={mediaType}
                            className={`${review.review ? 'mt-1' : 'mt-3'} text-sm`}
                        />
                    )}
                </div>
            </div>
        </Card>
    );
}

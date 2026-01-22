'use client';

import { Card } from '@/components/card';
import { RatingDisplay } from '@/components/input/rating';
import { SafeReview } from '@/lib/types';
import { ConsumedBadge } from '@/components/review/consumed-badge';
import { Calendar, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export function ReviewDetailCard({
    review,
    mediaType,
}: {
    review: SafeReview;
    mediaType?: string;
}) {
    const { user } = review;
    const locale = useLocale();
    const t = useTranslations('MediaPage');

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
            <div className="flex flex-row items-center justify-between gap-3">
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

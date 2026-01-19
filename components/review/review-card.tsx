'use client';

import { Card } from '@/components/card';
import { RatingDisplay } from '@/components/input/rating';
import { SafeReview } from '@/lib/types';
import { ConsumedBadge } from '@/components/review/consumed-badge';
import { User, ThumbsUp, ThumbsDown } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function ReviewCard({
    review,
    mediaType,
}: {
    review: SafeReview;
    mediaType?: string;
}) {
    const { user } = review;
    const router = useRouter();
    const t = useTranslations('MediaPage');

    return (
        <Card
            className="flex h-full cursor-pointer flex-col p-4 transition-opacity duration-200 hover:opacity-80 sm:p-6"
            onClick={() => router.push(`/review/${review.id}`)}
        >
            <div className="flex flex-row items-center gap-3 sm:gap-4">
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/profile/${user.id}`);
                    }}
                    className="transition-opacity hover:opacity-80"
                >
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full"
                            unoptimized
                        />
                    ) : (
                        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full border">
                            <User className="h-7 w-7" />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <p
                        className="text-base font-bold hover:underline"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/profile/${user.id}`);
                        }}
                    >
                        {user.name}
                    </p>
                    <div className="flex items-center gap-2">
                        {review.rating !== undefined &&
                            review.rating !== null && (
                                <RatingDisplay rating={review.rating} />
                            )}
                        {review.liked !== undefined &&
                            review.liked !== null && (
                                <div className="flex items-center gap-1">
                                    {review.liked ? (
                                        <>
                                            <ThumbsUp className="h-4 w-4 text-green-600" />
                                            <span className="text-muted-foreground text-sm">
                                                {t('like')}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <ThumbsDown className="h-4 w-4 text-red-600" />
                                            <span className="text-muted-foreground text-sm">
                                                {t('dislike')}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                    </div>
                </div>
            </div>
            <div className="flex-1">
                {review.review && (
                    <p className="mt-3 text-base leading-relaxed sm:mt-4">
                        {review.review}
                    </p>
                )}
            </div>
            {review.consumedMoreThanOnce && (
                <ConsumedBadge
                    mediaType={mediaType}
                    className="mt-auto text-sm"
                />
            )}
        </Card>
    );
}

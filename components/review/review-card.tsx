'use client';

import { Card } from '@/components/card';
import { RatingDisplay } from '@/components/input/rating';
import { SafeReview } from '@/lib/types';
import { User, ThumbsUp, ThumbsDown, Repeat } from 'lucide-react';
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
    const tConsumed = useTranslations('ConsumedMoreThanOnce');

    return (
        <Card
            className="cursor-pointer p-4 transition-opacity duration-200 hover:opacity-80 sm:p-6"
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
            {review.review && (
                <p className="mt-3 text-base leading-relaxed sm:mt-4">
                    {review.review}
                </p>
            )}
            {review.consumedMoreThanOnce && mediaType && (
                <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm italic">
                    <Repeat className="h-3 w-3" />
                    <span>
                        {tConsumed(
                            ['film', 'serie', 'book', 'game', 'music'].includes(
                                mediaType.toLowerCase()
                            )
                                ? mediaType.toLowerCase()
                                : 'default'
                        )}
                    </span>
                </div>
            )}
        </Card>
    );
}

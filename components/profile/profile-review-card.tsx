'use client';

import { Card } from '@/components/card';
import { RatingDisplay } from '@/components/input/rating';
import { SafeReviewWithMedia } from '@/lib/types';
import { ConsumedBadge } from '@/components/review/consumed-badge';
import { ThumbsDown, ThumbsUp, User } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

interface ProfileReviewCardProps {
    review: SafeReviewWithMedia;
    /**
     * Shows who wrote the review. Off on a profile, where every review belongs
     * to the same person; on in the feed, where the author is the point.
     */
    showAuthor?: boolean;
}

export function ProfileReviewCard({
    review,
    showAuthor = false,
}: ProfileReviewCardProps) {
    const { media, user } = review;
    const t = useTranslations('MediaPage');
    const tTypes = useTranslations('MediaTypes');
    const router = useRouter();

    return (
        <Card
            className="hover:border-accent h-full cursor-pointer overflow-hidden transition-all"
            onClick={() => router.push(`/review/${review.id}`)}
        >
            <div className="flex h-full min-h-28 sm:min-h-44">
                <div
                    className="group relative w-24 shrink-0 overflow-hidden sm:w-32"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/media/${media.id}`);
                    }}
                >
                    {media.poster ? (
                        <Image
                            src={media.poster}
                            alt={media.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized
                        />
                    ) : (
                        <div className="bg-muted flex h-full w-full items-center justify-center text-xs text-gray-400">
                            {t('noPoster')}
                        </div>
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
                    {showAuthor && (
                        <button
                            type="button"
                            data-testid="review-author"
                            className="mb-2 flex cursor-pointer items-center gap-2 self-start transition-opacity hover:opacity-80"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/profile/${user.id}`);
                            }}
                        >
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name}
                                    width={24}
                                    height={24}
                                    className="h-6 w-6 rounded-full"
                                    unoptimized
                                />
                            ) : (
                                <span className="bg-muted flex h-6 w-6 items-center justify-center rounded-full border">
                                    <User className="h-4 w-4" />
                                </span>
                            )}
                            <span className="max-w-40 truncate text-xs font-semibold hover:underline sm:max-w-56 sm:text-sm">
                                {user.name}
                            </span>
                        </button>
                    )}

                    <div className="mb-1.5 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <button
                                type="button"
                                className="line-clamp-1 cursor-pointer text-left text-base font-bold hover:underline sm:text-lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/media/${media.id}`);
                                }}
                            >
                                {media.title}
                            </button>

                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                {tTypes(media.type.toLowerCase() as string)} •{' '}
                                {media.year}
                            </p>
                        </div>
                        <span className="text-muted-foreground shrink-0 text-right text-xs">
                            {review.consumedDate
                                ? new Date(
                                      review.consumedDate
                                  ).toLocaleDateString()
                                : new Date(
                                      review.createdAt
                                  ).toLocaleDateString()}
                        </span>
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            {review.rating !== undefined &&
                                review.rating !== null && (
                                    <RatingDisplay
                                        rating={review.rating}
                                        size="sm"
                                    />
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

                        {review.review && (
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed sm:line-clamp-3">
                                &ldquo;{review.review}&rdquo;
                            </p>
                        )}
                    </div>

                    {review.consumedMoreThanOnce && (
                        <ConsumedBadge
                            mediaType={media.type}
                            className="mt-auto pt-1.5 text-xs"
                        />
                    )}
                </div>
            </div>
        </Card>
    );
}

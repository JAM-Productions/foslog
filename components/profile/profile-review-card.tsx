'use client';

import { Card } from '@/components/card';
import { RatingDisplay } from '@/components/input/rating';
import { SafeReviewWithMedia } from '@/lib/types';
import { ConsumedBadge } from '@/components/review/consumed-badge';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface ProfileReviewCardProps {
    review: SafeReviewWithMedia;
}

export function ProfileReviewCard({ review }: ProfileReviewCardProps) {
    const { media } = review;
    const t = useTranslations('MediaPage');
    const tTypes = useTranslations('MediaTypes');

    return (
        <Card className="overflow-hidden transition-all hover:border-gray-400 dark:hover:border-gray-600">
            <div className="flex flex-col sm:flex-row">
                <Link
                    href={`/media/${media.id}`}
                    className="group relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-32"
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
                </Link>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <div className="mb-2 flex items-start justify-between">
                        <div>
                            <Link
                                href={`/media/${media.id}`}
                                className="hover:text-primary transition-colors"
                            >
                                <h3 className="line-clamp-1 text-lg font-bold">
                                    {media.title}
                                </h3>
                            </Link>
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                {tTypes(media.type.toLowerCase() as string)} •{' '}
                                {media.year}
                            </p>
                        </div>
                        <span className="text-muted-foreground text-xs">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="mb-3 flex items-center gap-3">
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
                        <p className="text-muted-foreground mt-auto line-clamp-3 text-sm leading-relaxed">
                            &ldquo;{review.review}&rdquo;
                        </p>
                    )}
                    {review.consumedMoreThanOnce && (
                        <ConsumedBadge
                            mediaType={media.type}
                            className="mt-2 text-xs"
                        />
                    )}
                </div>
            </div>
        </Card>
    );
}

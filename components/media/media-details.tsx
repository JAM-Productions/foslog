'use client';

import { Card } from '@/components/card';
import { RatingDisplay } from '@/components/input/rating';
import { MediaItem } from '@/lib/store';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import {
    Book,
    Clapperboard,
    Gamepad2,
    Music,
    StickyNote,
    Tv,
    ThumbsUp,
    ThumbsDown,
    Bookmark,
} from 'lucide-react';
import { AITranslateText } from '@/components/ai-translate-text';
import { startTransition, useOptimistic, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useRouter } from '@/i18n/navigation';
import { useToastStore } from '@/lib/toast-store';

export function MediaDetails({
    media,
    hasBookmarked,
}: {
    media: MediaItem;
    hasBookmarked: boolean;
}) {
    const imageUrl = media.poster || media.cover;
    const tMP = useTranslations('MediaPage');
    const tMT = useTranslations('MediaTypes');
    const tGenres = useTranslations('MediaGenres');
    const tToast = useTranslations('Toast');
    const locale = useLocale();
    const { showToast } = useToastStore();

    const mediaTypes = [
        { value: 'film', Icon: Clapperboard },
        { value: 'series', Icon: Tv },
        { value: 'game', Icon: Gamepad2 },
        { value: 'book', Icon: Book },
        { value: 'music', Icon: Music },
    ] as const;

    const getMediaIcon = () => {
        const mediaType = mediaTypes.find((type) => type.value === media.type);
        return mediaType ? mediaType.Icon : StickyNote;
    };

    const MediaIcon = getMediaIcon();

    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [isBookmarking, setIsBookmarking] = useState(false);
    const [optimisticBookmarked, setOptimisticBookmarked] = useOptimistic(
        hasBookmarked,
        (prev) => !prev
    );

    const bookmarkMedia = () => {
        if (!currentUser) {
            return router.push('/login');
        }

        if (isBookmarking) return;

        setIsBookmarking(true);

        const prevState = optimisticBookmarked;
        const method = optimisticBookmarked ? 'DELETE' : 'POST';
        startTransition(async () => {
            setOptimisticBookmarked(!prevState);

            try {
                const response = await fetch(
                    `/api/media/${media.id}/bookmark`,
                    {
                        method,
                    }
                );

                if (!response.ok) {
                    throw new Error('Toggle bookmark failed');
                }

                router.refresh();
            } catch {
                setOptimisticBookmarked(prevState);
                showToast(tToast('toggleBookmarkFailed'), 'error');
            } finally {
                setIsBookmarking(false);
            }
        });
    };

    return (
        <div className="flex flex-col items-center gap-7 md:grid md:grid-cols-[1fr_auto] md:items-start">
            {imageUrl && (
                <div className="relative mt-2 aspect-[2/3] w-72 flex-shrink-0 md:order-2 md:mt-0">
                    <Image
                        src={imageUrl}
                        alt={media.title}
                        fill
                        className="rounded-lg object-cover shadow-lg"
                    />
                </div>
            )}
            <Card className="w-full self-stretch p-4 sm:p-6 md:order-1 lg:p-8">
                {/* Details Section */}
                <div className="flex h-full flex-col justify-between gap-4 sm:gap-6">
                    <div className="flex flex-col gap-4 sm:gap-6">
                        {/* Title and Type */}
                        <div className="flex flex-col gap-2 sm:gap-3">
                            <h1 className="text-foreground text-3xl leading-tight font-bold lg:text-4xl">
                                {media.title}
                                <button
                                    className="ml-3 inline-flex flex-shrink-0 cursor-pointer items-center align-middle transition-colors disabled:opacity-70"
                                    data-testid="bookmark-button"
                                    aria-label={
                                        optimisticBookmarked
                                            ? tMP('unbookmark')
                                            : tMP('bookmark')
                                    }
                                    disabled={isBookmarking}
                                    onClick={() => bookmarkMedia()}
                                >
                                    <Bookmark
                                        className={`${optimisticBookmarked ? 'fill-green-600 text-green-600' : 'text-green-600 hover:fill-green-600'} h-6 w-6 transition-all lg:h-7 lg:w-7`}
                                    />
                                </button>
                            </h1>

                            <div className="flex flex-wrap gap-1">
                                <span className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded px-1.5 py-0.5 text-sm">
                                    <MediaIcon className="h-3.5 w-3.5" />
                                    {tMT(media.type)}
                                </span>
                                {media.genre.map((genre) => (
                                    <span
                                        key={genre}
                                        className="bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 text-sm"
                                    >
                                        {tGenres(genre)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex flex-col gap-3 rounded-lg py-3 sm:gap-4">
                            <div className="flex flex-row items-start gap-3 sm:items-center sm:gap-4">
                                {media.averageRating > 0 && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <RatingDisplay
                                                rating={media.averageRating}
                                                size="lg"
                                            />
                                        </div>
                                        <div className="bg-border block h-8 w-px"></div>
                                    </>
                                )}
                                <span className="text-muted-foreground text-base whitespace-nowrap">
                                    {media.totalReviews}{' '}
                                    {media.totalReviews === 1
                                        ? tMP('review')
                                        : tMP('reviews')}
                                </span>
                            </div>
                            {(media.totalLikes > 0 ||
                                media.totalDislikes > 0) && (
                                <div className="flex flex-row items-center gap-4">
                                    <div className="bg-background flex items-center gap-3 rounded-full px-2 py-0.5">
                                        <div className="flex items-center gap-2">
                                            <ThumbsUp className="h-4 w-4 text-green-600" />
                                            <span className="text-muted-foreground text-sm">
                                                {media.totalLikes}
                                            </span>
                                        </div>
                                        <div className="bg-border block h-4 w-px"></div>
                                        <div className="flex items-center gap-2">
                                            <ThumbsDown className="h-4 w-4 text-red-600" />
                                            <span className="text-muted-foreground text-sm">
                                                {media.totalDislikes}
                                            </span>
                                        </div>
                                    </div>
                                    {media.totalLikes + media.totalDislikes >
                                        0 && (
                                        <>
                                            <span className="text-muted-foreground text-sm">
                                                {tMP('likePercentage', {
                                                    percentage: Math.round(
                                                        (media.totalLikes /
                                                            (media.totalLikes +
                                                                media.totalDislikes)) *
                                                            100
                                                    ),
                                                })}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-foreground mb-2 text-lg font-semibold sm:mb-3 sm:text-xl">
                                {tMP('overview')}
                            </h2>
                            <p className="text-card-foreground text-sm leading-relaxed sm:text-base">
                                <AITranslateText
                                    text={media.description}
                                    targetLanguage={locale}
                                />
                            </p>
                        </div>
                    </div>
                    {/* Release Date */}
                    {media.year && (
                        <p className="text-muted-foreground text-sm sm:text-base">
                            {tMP('releaseDate', { date: media.year })}
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}

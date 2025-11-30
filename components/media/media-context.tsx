import { Card } from '@/components/card';
import { useTranslations } from 'next-intl';
import {
    Book,
    Clapperboard,
    Gamepad2,
    Music,
    StickyNote,
    Tv,
} from 'lucide-react';
import Image from 'next/image';
import { MediaItem } from '@/lib/store';
import { RatingDisplay } from '../input/rating';

export function MediaContext({ media }: { media: MediaItem }) {
    const imageUrl = media.poster || media.cover;
    const tMP = useTranslations('MediaPage');
    const tMT = useTranslations('MediaTypes');
    const tGenres = useTranslations('MediaGenres');

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
                        <div className="flex flex-row items-start gap-3 rounded-lg py-3 sm:items-center sm:gap-4">
                            <div className="flex items-center gap-2">
                                <RatingDisplay
                                    rating={media.averageRating}
                                    size="lg"
                                />
                            </div>
                            <div className="bg-border block h-8 w-px"></div>
                            <span className="text-muted-foreground text-base whitespace-nowrap">
                                {media.totalReviews}{' '}
                                {media.totalReviews === 1
                                    ? tMP('review')
                                    : tMP('reviews')}
                            </span>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-foreground mb-2 text-lg font-semibold sm:mb-3 sm:text-xl">
                                {tMP('overview')}
                            </h2>
                            <p className="text-card-foreground text-sm leading-relaxed sm:text-base">
                                {media.description}
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

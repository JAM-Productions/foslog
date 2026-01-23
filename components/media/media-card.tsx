'use client';

import {
    Star,
    StarHalf,
    Eye,
    Calendar,
    Clapperboard,
    Tv,
    Gamepad2,
    Book,
    Music,
    StickyNote,
    ThumbsUp,
    ThumbsDown,
} from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/card';
import { MediaItem } from '@/lib/store';
import { useTranslations } from 'next-intl';

interface MediaCardProps {
    media: MediaItem;
    className?: string;
}

const getMediaIcon = (type: MediaItem['type']) => {
    switch (type) {
        case 'film':
            return Clapperboard;
        case 'series':
            return Tv;
        case 'game':
            return Gamepad2;
        case 'book':
            return Book;
        case 'music':
            return Music;
        default:
            return StickyNote;
    }
};

const StarRating = ({
    rating,
    size = 'sm',
}: {
    rating: number;
    size?: 'sm' | 'md';
}) => {
    const stars = Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(rating);
        const halfFilled = i === Math.floor(rating) && rating % 1 >= 0.5;

        return (
            <div
                key={i}
                className="relative"
            >
                <Star
                    className={`text-muted-foreground ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`}
                />
                {filled && (
                    <Star
                        className={`absolute top-0 left-0 fill-amber-400 text-amber-400 ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`}
                    />
                )}
                {halfFilled && (
                    <StarHalf
                        className={`absolute top-0 left-0 fill-amber-400 text-amber-400 ${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`}
                    />
                )}
            </div>
        );
    });

    return <div className="flex items-center gap-0.5">{stars}</div>;
};

export default function MediaCard({ media, className }: MediaCardProps) {
    const t = useTranslations('MediaCard');
    const tGenres = useTranslations('MediaGenres');
    const tMediaTypes = useTranslations('MediaTypes');

    const getCreatorLabel = (media: MediaItem) => {
        if (media.director) return `${t('director')} ${media.director}`;
        if (media.author) return `${t('by')} ${media.author}`;
        if (media.artist) return media.artist;
        return '';
    };

    const imageUrl = media.poster || media.cover;
    const creatorLabel = getCreatorLabel(media);

    const MediaIcon = getMediaIcon(media.type);

    return (
        <Card
            className={`group flex h-full flex-col transition-all hover:shadow-lg${className ? ` ${className}` : ''}`}
        >
            <div className="flex h-full flex-col p-0">
                {/* Image */}
                <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-t-lg">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={media.title}
                            className="object-cover transition-transform group-hover:scale-105"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="text-muted-foreground flex h-full w-full items-center justify-center">
                            <MediaIcon className="h-16 w-16" />
                        </div>
                    )}

                    {/* Type Badge */}
                    <div className="bg-background/90 absolute top-2 left-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium backdrop-blur-sm">
                        <MediaIcon className="h-3 w-3" />
                        {tMediaTypes(
                            media.type === 'music' ? 'musicSingle' : media.type
                        )}
                    </div>

                    {/* Year Badge */}
                    {media.year && (
                        <div className="bg-background/90 absolute top-2 right-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium backdrop-blur-sm">
                            <Calendar className="h-3 w-3" />
                            {media.year}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <div className="flex flex-1 flex-col space-y-2">
                        {/* Title */}
                        <h3
                            className="line-clamp-2 text-sm leading-tight font-semibold"
                            title={media.title}
                        >
                            {media.title}
                        </h3>

                        {/* Creator */}
                        {creatorLabel && (
                            <p
                                className="text-muted-foreground line-clamp-1 text-xs"
                                title={creatorLabel}
                            >
                                {creatorLabel}
                            </p>
                        )}

                        {/* Genres */}
                        <div className="flex flex-1 flex-wrap content-start gap-1 overflow-hidden">
                            {media.genre.map((genre) => (
                                <span
                                    key={genre}
                                    className="bg-secondary text-secondary-foreground line-clamp-1 rounded px-1.5 py-0.5 text-xs break-all"
                                >
                                    {tGenres(genre)}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Rating and Reviews */}
                    <div className="flex items-center justify-between">
                        {media.averageRating > 0 ? (
                            <div className="flex items-center gap-1">
                                <StarRating rating={media.averageRating} />
                                <span className="text-muted-foreground ml-1 text-xs">
                                    {media.averageRating.toFixed(1)}
                                </span>
                            </div>
                        ) : media.totalLikes > 0 || media.totalDislikes > 0 ? (
                            <div className="bg-background mt-0.5 flex items-center gap-2 rounded-full px-2 py-0.5">
                                <div className="flex items-center gap-2">
                                    <ThumbsUp className="h-3 w-3 text-green-600" />
                                    <span className="text-muted-foreground text-xs">
                                        {media.totalLikes}
                                    </span>
                                </div>
                                <div className="bg-border block h-3 w-px"></div>
                                <div className="flex items-center gap-2">
                                    <ThumbsDown className="h-3 w-3 text-red-600" />
                                    <span className="text-muted-foreground text-xs">
                                        {media.totalDislikes}
                                    </span>
                                </div>
                            </div>
                        ) : null}

                        <div className="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
                            <Eye className="h-3 w-3" />
                            {media.totalReviews.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

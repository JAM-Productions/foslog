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

    return (
        <Card
            className={`group transition-all hover:shadow-lg${className ? ` ${className}` : ''}`}
        >
            <div className="p-0">
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
                            {(() => {
                                const Icon = getMediaIcon(media.type);
                                return <Icon className="h-16 w-16" />;
                            })()}
                        </div>
                    )}

                    {/* Type Badge */}
                    <div className="bg-background/90 absolute top-2 left-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium backdrop-blur-sm">
                        {(() => {
                            const Icon = getMediaIcon(media.type);
                            return <Icon className="h-3 w-3" />;
                        })()}
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
                <div className="p-4">
                    <div className="space-y-2">
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
                        <div className="flex flex-wrap gap-1">
                            {media.genre.slice(0, 2).map((genre) => (
                                <span
                                    key={genre}
                                    className="bg-secondary text-secondary-foreground rounded px-1.5 py-0.5 text-xs"
                                >
                                    {tGenres(genre)}
                                </span>
                            ))}
                            {media.genre.length > 2 && (
                                <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                                    {t('more', {
                                        count: media.genre.length - 2,
                                    })}
                                </span>
                            )}
                        </div>

                        {/* Rating and Reviews */}
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1">
                                <StarRating rating={media.averageRating} />
                                <span className="text-muted-foreground ml-1 text-xs">
                                    {media.averageRating.toFixed(1)}
                                </span>
                            </div>

                            <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                <Eye className="h-3 w-3" />
                                {media.totalReviews.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

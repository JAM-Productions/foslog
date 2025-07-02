'use client';

import { Star, Eye, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MediaItem } from '@/lib/store';
import { cn } from '@/lib/utils';

interface MediaCardProps {
    media: MediaItem;
    className?: string;
}

const getMediaIcon = (type: MediaItem['type']) => {
    switch (type) {
        case 'film':
            return '🎬';
        case 'series':
            return '📺';
        case 'game':
            return '🎮';
        case 'book':
            return '📚';
        case 'music':
            return '🎵';
        default:
            return '📄';
    }
};

const getCreatorLabel = (media: MediaItem) => {
    if (media.director) return `Dir. ${media.director}`;
    if (media.author) return `by ${media.author}`;
    if (media.artist) return media.artist;
    return '';
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
                    className={cn(
                        'text-muted-foreground',
                        size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
                    )}
                />
                {(filled || halfFilled) && (
                    <Star
                        className={cn(
                            'absolute top-0 left-0 fill-amber-400 text-amber-400',
                            size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
                            halfFilled && 'w-1/2 overflow-hidden'
                        )}
                    />
                )}
            </div>
        );
    });

    return <div className="flex items-center gap-0.5">{stars}</div>;
};

export default function MediaCard({ media, className }: MediaCardProps) {
    const imageUrl = media.poster || media.cover;
    const creatorLabel = getCreatorLabel(media);

    return (
        <Card
            className={cn(
                'group cursor-pointer transition-all hover:shadow-lg',
                className
            )}
        >
            <CardContent className="p-0">
                {/* Image */}
                <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-t-lg">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={media.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="text-muted-foreground flex h-full w-full items-center justify-center text-4xl">
                            {getMediaIcon(media.type)}
                        </div>
                    )}

                    {/* Type Badge */}
                    <div className="bg-background/90 absolute top-2 left-2 rounded-md px-2 py-1 text-xs font-medium backdrop-blur-sm">
                        <span className="mr-1">{getMediaIcon(media.type)}</span>
                        {media.type.charAt(0).toUpperCase() +
                            media.type.slice(1)}
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
                                    {genre}
                                </span>
                            ))}
                            {media.genre.length > 2 && (
                                <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                                    +{media.genre.length - 2}
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
            </CardContent>
        </Card>
    );
}

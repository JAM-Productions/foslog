import { Card } from '@/components/card';
import { useTranslations } from 'next-intl';
import {
    Book,
    Clapperboard,
    Eye,
    Gamepad2,
    Music,
    Star,
    StickyNote,
    ThumbsDown,
    ThumbsUp,
    Tv,
} from 'lucide-react';
import { SafeMediaItem } from '@/lib/types';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';

interface MediaContextProps {
    media: SafeMediaItem;
}

export function MediaContext({ media }: MediaContextProps) {
    const tRP = useTranslations('ReviewPage');
    const tMT = useTranslations('MediaTypes');
    const tGenres = useTranslations('MediaGenres');
    const tMC = useTranslations('MediaCard');
    const router = useRouter();

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
        <div className="flex md:flex-col">
            {media.poster ? (
                <div className="relative aspect-[2/3] w-32 shrink-0 md:w-full">
                    <Image
                        src={media.poster}
                        alt={media.title}
                        fill
                        className="cursor-pointer rounded-l-lg rounded-r-none object-cover transition-opacity duration-200 hover:opacity-85 md:rounded-t-lg md:rounded-b-none"
                        unoptimized
                        onClick={() => router.push(`/media/${media.id}`)}
                    />
                </div>
            ) : (
                <div className="bg-primary/10 text-primary flex aspect-[2/3] w-32 shrink-0 items-center justify-center rounded-l-lg rounded-r-none md:w-full md:rounded-t-lg md:rounded-b-none">
                    <MediaIcon className="h-16 w-16" />
                </div>
            )}
            <Card className="flex w-full flex-col rounded-l-none rounded-r-lg border-l-0 shadow-sm hover:shadow-sm md:rounded-t-none md:rounded-b-lg md:border-t-0 md:border-l">
                <div className="flex flex-1 flex-col gap-2 p-4 sm:gap-3 sm:p-5">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="from-primary/0 via-primary/50 to-primary/0 h-px flex-1 bg-gradient-to-r" />
                            <span className="text-muted-foreground text-xs font-semibold tracking-widest whitespace-nowrap uppercase">
                                {tRP('reviewFor')}
                            </span>
                            <div className="from-primary/0 via-primary/50 to-primary/0 h-px flex-1 bg-gradient-to-r" />
                        </div>

                        <h2
                            className="text-foreground line-clamp-2 cursor-pointer text-xl leading-tight font-bold tracking-tight hover:underline sm:text-lg"
                            onClick={() => router.push(`/media/${media.id}`)}
                        >
                            {media.title}
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-1">
                        <span className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded px-1.5 py-0.5 text-xs">
                            <MediaIcon className="h-3 w-3" />
                            {tMT(media.type)}
                        </span>
                        {media.genre.slice(0, 2).map((genre) => (
                            <span
                                key={genre}
                                className="bg-secondary text-secondary-foreground line-clamp-1 rounded px-1.5 py-0.5 text-xs break-all"
                            >
                                {tGenres(genre)}
                            </span>
                        ))}
                        {media.genre.length > 2 && (
                            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                                {tMC('more', {
                                    count: media.genre.length - 2,
                                })}
                            </span>
                        )}
                    </div>
                    <div className="mt-auto flex items-center gap-3">
                        {media.averageRating > 0 ? (
                            <div className="flex items-center">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-muted-foreground ml-1 text-xs">
                                    {media.averageRating.toFixed(1)}
                                </span>
                            </div>
                        ) : media.totalLikes > 0 || media.totalDislikes > 0 ? (
                            <div className="bg-background flex items-center gap-2 rounded-full px-2 py-0.5">
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
            </Card>
        </div>
    );
}

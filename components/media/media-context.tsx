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
import { SafeMediaItem } from '@/lib/types';
import Image from 'next/image';

interface MediaContextProps {
    media: SafeMediaItem;
}

export function MediaContext({ media }: MediaContextProps) {
    const tRP = useTranslations('ReviewPage');
    const tMT = useTranslations('MediaTypes');

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
        <div className="flex gap-3 sm:flex-col">
            {media.poster ? (
                <div className="relative aspect-[2/3] w-32 shrink-0 sm:w-full">
                    <Image
                        src={media.poster}
                        alt={media.title}
                        fill
                        className="rounded-lg object-cover"
                        unoptimized
                    />
                </div>
            ) : (
                <div className="bg-primary/10 text-primary flex aspect-[2/3] w-32 shrink-0 items-center justify-center rounded-lg sm:w-full">
                    <MediaIcon className="h-16 w-16" />
                </div>
            )}
            <Card>
                <div className="flex flex-col gap-2 p-4 sm:gap-3 sm:p-5">
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase sm:text-sm">
                            {tRP('reviewFor')}
                        </p>
                        <h2 className="text-foreground text-lg leading-tight font-semibold sm:text-base lg:text-lg xl:text-xl">
                            {media.title}
                        </h2>
                    </div>
                    <span className="bg-secondary text-secondary-foreground flex w-fit items-center gap-1.5 rounded px-2 py-1 text-xs font-medium sm:text-sm">
                        <MediaIcon className="h-3.5 w-3.5" />
                        {tMT(media.type)}
                    </span>
                </div>
            </Card>
        </div>
    );
}

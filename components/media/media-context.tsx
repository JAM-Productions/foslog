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

interface MediaContextProps {
    media: {
        id: string;
        title: string;
        type: string;
    };
}

export function MediaContext({ media }: MediaContextProps) {
    const tMT = useTranslations('MediaTypes');
    const tRP = useTranslations('ReviewPage');

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
        <Card className="p-4 sm:p-5">
            <div className="group flex items-center gap-3">
                <div className="bg-primary/10 text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                    <MediaIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase sm:text-sm">
                        {tRP('reviewFor')}
                    </p>
                    <h2 className="text-foreground truncate text-lg font-semibold sm:text-xl">
                        {media.title}
                    </h2>
                </div>
                <span className="bg-secondary text-secondary-foreground flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium sm:text-sm">
                    <MediaIcon className="h-3.5 w-3.5" />
                    {tMT(media.type)}
                </span>
            </div>
        </Card>
    );
}

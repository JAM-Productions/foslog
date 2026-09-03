import { cn } from '@/lib/utils';
import { getMediaTypeMessageKey } from '@/utils/media-type';
import { Repeat } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ConsumedBadgeProps {
    mediaType?: string;
    className?: string;
}

export function ConsumedBadge({ mediaType, className }: ConsumedBadgeProps) {
    const tConsumed = useTranslations('ConsumedMoreThanOnce');

    if (!mediaType) return null;

    return (
        <div
            className={cn(
                'text-muted-foreground flex items-center gap-2 italic',
                className
            )}
        >
            <Repeat className="h-3 w-3 shrink-0" />
            <span className="min-w-0 truncate">
                {tConsumed(getMediaTypeMessageKey(mediaType))}
            </span>
        </div>
    );
}

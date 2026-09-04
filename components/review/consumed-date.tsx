import { toDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { getMediaTypeMessageKey } from '@/utils/media-type';
import { CalendarCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

interface ConsumedDateProps {
    date?: Date | string;
    mediaType?: string;
    className?: string;
}

/** When the review's author watched, read, played or listened to the media. */
export function ConsumedDate({
    date,
    mediaType,
    className,
}: ConsumedDateProps) {
    const tConsumedDate = useTranslations('ConsumedDate');
    const locale = useLocale();

    if (!date) return null;

    const consumedDate = toDate(date);

    return (
        <div
            className={cn(
                'text-muted-foreground flex items-center gap-2',
                className
            )}
        >
            <CalendarCheck className="h-3 w-3 shrink-0" />
            <span className="min-w-0 truncate">
                {tConsumedDate(
                    mediaType ? getMediaTypeMessageKey(mediaType) : 'default',
                    {
                        date: consumedDate.toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        }),
                    }
                )}
            </span>
        </div>
    );
}

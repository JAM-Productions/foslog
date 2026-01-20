import { cn } from '@/lib/utils';
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
            <Repeat className="h-3 w-3" />
            <span>
                {tConsumed(
                    ['film', 'serie', 'book', 'game', 'music'].includes(
                        mediaType.toLowerCase()
                    )
                        ? mediaType.toLowerCase()
                        : 'default'
                )}
            </span>
        </div>
    );
}

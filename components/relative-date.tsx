'use client';

import { formatRelativeTime, toDate } from '@/lib/date';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

/** How often the label catches up with the clock while the page stays open. */
const REFRESH_INTERVAL_MS = 60 * 1000;

export interface RelativeDateProps {
    date: Date | string;
    className?: string;
}

/** When something was posted, told as "25 minutes ago" or "Last week". */
export function RelativeDate({ date, className }: RelativeDateProps) {
    const locale = useLocale();
    const [now, setNow] = useState(() => new Date());

    const target = useMemo(() => toDate(date), [date]);

    useEffect(() => {
        const interval = setInterval(
            () => setNow(new Date()),
            REFRESH_INTERVAL_MS
        );

        return () => clearInterval(interval);
    }, []);

    return (
        <time
            dateTime={target.toISOString()}
            className={className}
        >
            {formatRelativeTime(target, locale, now)}
        </time>
    );
}

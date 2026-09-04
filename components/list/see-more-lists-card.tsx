'use client';

import { Ellipsis } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface SeeMoreListsCardProps {
    onClick: () => void;
}

/**
 * Desktop-only tile that sits in the list row as if it were one more list.
 * On mobile the row falls back to a full-width button.
 */
export function SeeMoreListsCard({ onClick }: SeeMoreListsCardProps) {
    const t = useTranslations('ProfilePage');

    return (
        <button
            type="button"
            data-testid="see-more-lists-card"
            aria-label={t('seeMore')}
            onClick={onClick}
            className="group hidden cursor-pointer flex-col items-start gap-1 sm:flex"
        >
            <span
                data-hover-target
                className="border-muted-foreground/40 text-muted-foreground flex h-24 w-24 items-center justify-center rounded-lg border border-dashed transition-opacity group-has-[[data-hover-target]:hover]:opacity-80"
            >
                <Ellipsis className="h-7 w-7" />
            </span>
            <span
                data-hover-target
                className="text-foreground w-fit max-w-24 truncate text-left text-sm group-has-[[data-hover-target]:hover]:underline"
            >
                {t('seeMore')}
            </span>
        </button>
    );
}

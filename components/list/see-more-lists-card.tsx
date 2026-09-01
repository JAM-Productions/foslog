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
            <span className="border-muted-foreground/40 text-muted-foreground ring-ring ring-offset-background flex h-24 w-24 items-center justify-center rounded-lg border border-dashed ring-offset-2 transition group-hover:opacity-80 group-hover:ring-2">
                <Ellipsis className="h-7 w-7" />
            </span>
            <span className="text-foreground w-24 truncate text-left text-sm group-hover:underline">
                {t('seeMore')}
            </span>
        </button>
    );
}

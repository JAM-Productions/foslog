'use client';

import { FeedFilter } from '@/lib/types';
import { Globe, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export interface FeedFilterTabsProps {
    selectedFilter: FeedFilter;
}

/** Switches the feed between everyone and the people the viewer follows. */
export function FeedFilterTabs({ selectedFilter }: FeedFilterTabsProps) {
    const t = useTranslations('FeedPage');
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleFilterChange = (filter: FeedFilter) => {
        const params = new URLSearchParams(searchParams);

        if (filter === 'all') {
            params.delete('filter');
        } else {
            params.set('filter', filter);
        }

        // A different feed means a different first page.
        params.delete('page');

        const newUrl = params.toString()
            ? `${pathname}?${params.toString()}`
            : pathname;

        router.push(newUrl);
    };

    const filters = [
        { value: 'all', label: t('filterAll'), Icon: Globe },
        { value: 'following', label: t('filterFollowing'), Icon: Users },
    ] as const;

    return (
        <div className="bg-muted flex w-full items-center gap-1 rounded-lg p-1 sm:w-fit">
            {filters.map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => handleFilterChange(filter.value)}
                    aria-pressed={selectedFilter === filter.value}
                    className={[
                        'flex flex-1 cursor-pointer items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:flex-none',
                        selectedFilter === filter.value
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-primary hover:text-foreground hover:bg-background/50',
                    ].join(' ')}
                >
                    <filter.Icon className="mr-1.5 h-4 w-4" />
                    {filter.label}
                </button>
            ))}
        </div>
    );
}

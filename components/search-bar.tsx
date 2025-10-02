'use client';

import { Search } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useTranslations } from 'next-intl';

const SearchBar = () => {
    const { searchQuery, setSearchQuery } = useAppStore();

    const t = useTranslations('Search');

    return (
        <div className="relative max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <input
                type="text"
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border-input focus:ring-ring w-full rounded-lg border py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:outline-none"
            />
        </div>
    );
};

export default SearchBar;

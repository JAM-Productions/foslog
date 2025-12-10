'use client';

import { CornerDownRight, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const SearchBar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || ''
    );

    const t = useTranslations('Search');

    const handleSearch = () => {
        const params = new URLSearchParams(window.location.search);

        if (searchValue.trim()) {
            params.set('search', searchValue.trim());
        } else {
            params.delete('search');
        }

        params.delete('page');

        const newUrl = params.toString()
            ? `${pathname}?${params.toString()}`
            : pathname;

        router.push(newUrl);
    };

    return (
        <div className="flex w-full gap-2">
            <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    aria-label={t('searchPlaceholder')}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                    className="bg-background border-input focus:ring-ring w-full rounded-lg border py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:outline-none"
                />
            </div>
            <button
                type="button"
                className="hover:bg-accent cursor-pointer rounded-md p-2 transition-colors"
                aria-label="Search"
                title="Search"
                onClick={handleSearch}
            >
                <CornerDownRight className="h-5 w-5" />
            </button>
        </div>
    );
};

export default SearchBar;

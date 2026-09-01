'use client';

import { Suspense, useState } from 'react';
import { ListFilterPlus } from 'lucide-react';

import SearchBar from '@/components/header/search-bar';
import SearchBarSkeleton from '@/components/header/search-bar-skeleton';
import MediaTypeFilter from '@/components/media/media-type-filter';
import MediaTypeFilterSkeleton from '@/components/media/media-type-filter-skeleton';

/**
 * Same search experience as the home page: a collapsible media type filter
 * plus a search bar that only runs on submit. Both write to the URL, which the
 * list page reads to filter server side.
 */
export function ListMediaFilters() {
    const [isFilterExpanded, setIsFilterExpanded] = useState(false);

    return (
        <div className="mt-8">
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    className="hover:bg-accent cursor-pointer rounded-md p-2 transition-colors"
                    aria-label={
                        isFilterExpanded ? 'Collapse filter' : 'Expand filter'
                    }
                    title={
                        isFilterExpanded ? 'Collapse filter' : 'Expand filter'
                    }
                    data-testid="list-filter-toggle"
                >
                    <ListFilterPlus
                        className={`${isFilterExpanded ? 'text-primary' : ''} h-5 w-5`}
                    />
                </button>
                <Suspense fallback={<SearchBarSkeleton />}>
                    <SearchBar />
                </Suspense>
            </div>

            <div
                className={`transition-all duration-300 ${
                    isFilterExpanded
                        ? 'max-h-40 pt-4 opacity-100'
                        : 'max-h-0 overflow-hidden opacity-0'
                }`}
                data-testid="list-media-type-filter"
            >
                <Suspense fallback={<MediaTypeFilterSkeleton />}>
                    <MediaTypeFilter />
                </Suspense>
            </div>
        </div>
    );
}

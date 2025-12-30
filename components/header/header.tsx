'use client';

import Image from 'next/image';
import MediaTypeFilter from '@/components/media/media-type-filter';
import MediaTypeFilterSkeleton from '@/components/media/media-type-filter-skeleton';
import ThemeToggle from '@/components/theme/theme-toggle';
import UserMenu from '@/components/header/user-menu';
import SearchBar from '@/components/header/search-bar';
import SearchBarSkeleton from '@/components/header/search-bar-skeleton';
import LanguageSelector from '@/components/header/language-selector';
import { useState, Suspense } from 'react';
import { ListFilterPlus } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function Header() {
    const t = useTranslations('Header');
    const pathname = usePathname();
    // Check if we're on the home route (with or without locale)
    const isHomePage =
        pathname === '/' ||
        routing.locales.some(
            (locale) => pathname === `/${locale}` || pathname === `/${locale}/`
        );

    const [isFilterExpanded, setIsFilterExpanded] = useState(false);

    const FilterToggleButton = () => (
        <button
            type="button"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="hover:bg-accent cursor-pointer rounded-md p-2 transition-colors"
            aria-label={isFilterExpanded ? 'Collapse filter' : 'Expand filter'}
            title={isFilterExpanded ? 'Collapse filter' : 'Expand filter'}
        >
            <ListFilterPlus
                className={`${isFilterExpanded ? 'text-primary' : ''} h-5 w-5`}
            />
        </button>
    );

    return (
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2"
                    >
                        <div className="flex h-8 w-8 items-center justify-center">
                            <Image
                                src="/favicon.svg"
                                alt="Foslog"
                                width={32}
                                height={32}
                                className="h-8 w-8"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            Foslog
                        </span>
                    </Link>

                    <Link
                        href="/blog"
                        className="ml-4 text-lg font-medium text-foreground/60 transition-colors hover:text-foreground/80"
                    >
                        {t('blog')}
                    </Link>

                    {/* Search - Always visible on desktop when on home page */}
                    {isHomePage && (
                        <div className="mx-8 hidden max-w-lg flex-1 lg:flex lg:max-w-3xl lg:gap-2">
                            <FilterToggleButton />
                            <Suspense fallback={<SearchBarSkeleton />}>
                                <SearchBar />
                            </Suspense>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <LanguageSelector />
                        <ThemeToggle />
                        <UserMenu />
                    </div>
                </div>

                {/* Mobile Search - Always visible when on home page */}
                {isHomePage && (
                    <div className="flex max-h-20 gap-2 pb-4 opacity-100 transition-all duration-300 lg:hidden">
                        <FilterToggleButton />
                        <Suspense fallback={<SearchBarSkeleton />}>
                            <SearchBar />
                        </Suspense>
                    </div>
                )}

                {/* Media Type Filter - Collapsible only when on home page */}
                {isHomePage && (
                    <div
                        className={`transition-all duration-300 ${
                            isFilterExpanded
                                ? 'max-h-40 pb-4 opacity-100'
                                : 'max-h-0 overflow-hidden opacity-0'
                        }`}
                    >
                        <Suspense fallback={<MediaTypeFilterSkeleton />}>
                            <MediaTypeFilter />
                        </Suspense>
                    </div>
                )}
            </div>
        </header>
    );
}

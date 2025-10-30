'use client';

import Image from 'next/image';
import MediaTypeFilter from '@/components/media-type-filter';
import ThemeToggle from '@/components/theme-toggle';
import UserMenu from '@/components/user-menu';
import SearchBar from '@/components/search-bar';
import LanguageSelector from '@/components/language-selector';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Header() {
    const autoCollapsed = useScrollDirection();
    const [manuallyCollapsed, setManuallyCollapsed] = useState(false);

    // Header is collapsed if either auto-collapsed from scrolling or manually toggled
    const isCollapsed = autoCollapsed || manuallyCollapsed;

    return (
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
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
                    </div>

                    {/* Search */}
                    <div
                        className={`mx-8 hidden max-w-md flex-1 transition-all duration-300 md:flex ${isCollapsed ? 'max-h-0 overflow-hidden opacity-0' : 'opacity-100'}`}
                    >
                        <SearchBar />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() =>
                                setManuallyCollapsed(!manuallyCollapsed)
                            }
                            className="hover:bg-accent rounded-md p-2 transition-colors"
                            aria-label={
                                isCollapsed
                                    ? 'Expand header'
                                    : 'Collapse header'
                            }
                            title={
                                isCollapsed
                                    ? 'Expand header'
                                    : 'Collapse header'
                            }
                        >
                            {isCollapsed ? (
                                <ChevronDown className="h-5 w-5" />
                            ) : (
                                <ChevronUp className="h-5 w-5" />
                            )}
                        </button>
                        <LanguageSelector />
                        <ThemeToggle />
                        <UserMenu />
                    </div>
                </div>

                {/* Mobile Search */}
                <div
                    className={`transition-all duration-300 md:hidden ${isCollapsed ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-20 pb-4 opacity-100'}`}
                >
                    <SearchBar />
                </div>

                {/* Media Type Filter */}
                <div
                    className={`transition-all duration-300 ${isCollapsed ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-40 pb-4 opacity-100'}`}
                >
                    <MediaTypeFilter />
                </div>
            </div>
        </header>
    );
}

'use client';

import Image from 'next/image';
import MediaTypeFilter from '@/components/media-type-filter';
import ThemeToggle from '@/components/theme-toggle';
import UserMenu from '@/components/user-menu';
import SearchBar from '@/components/search-bar';
import LanguageSelector from '@/components/language-selector';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
    // Manual toggle only - no auto-collapse on scroll
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Helper function for collapsible element classes
    // Uses explicit Tailwind class names to avoid purging issues in production
    const getCollapsibleClasses = (
        baseClasses: string,
        collapsedHeight: '0' | '20' | '40' = '0'
    ) => {
        let collapsed = '';
        let expanded = '';

        if (collapsedHeight === '0') {
            collapsed = 'max-h-0 overflow-hidden opacity-0';
            expanded = 'opacity-100';
        } else if (collapsedHeight === '20') {
            collapsed = 'max-h-0 overflow-hidden opacity-0';
            expanded = 'max-h-20 pb-4 opacity-100';
        } else if (collapsedHeight === '40') {
            collapsed = 'max-h-0 overflow-hidden opacity-0';
            expanded = 'max-h-40 pb-4 opacity-100';
        }

        return `${baseClasses} transition-all duration-300 ${isCollapsed ? collapsed : expanded}`;
    };

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

                    {/* Search */}
                    <div
                        className={getCollapsibleClasses(
                            'mx-8 hidden max-w-md flex-1 md:flex'
                        )}
                    >
                        <SearchBar />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
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
                <div className={getCollapsibleClasses('md:hidden', '20')}>
                    <SearchBar />
                </div>

                {/* Media Type Filter */}
                <div className={getCollapsibleClasses('', '40')}>
                    <MediaTypeFilter />
                </div>
            </div>
        </header>
    );
}

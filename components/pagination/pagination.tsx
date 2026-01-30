'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/button/button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    // Start with a safe default that works for mobile to prevent hydration mismatch
    const [maxVisible, setMaxVisible] = React.useState(3);

    React.useEffect(() => {
        const updateMaxVisible = () => {
            // Show 3 pages on small screens (< 640px), 5 on medium (< 768px), 7 on larger
            if (window.innerWidth < 640) {
                setMaxVisible(3);
            } else if (window.innerWidth < 768) {
                setMaxVisible(5);
            } else {
                setMaxVisible(7);
            }
        };

        updateMaxVisible();
        window.addEventListener('resize', updateMaxVisible);
        return () => window.removeEventListener('resize', updateMaxVisible);
    }, []);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;

        // Update URL with new page parameter
        const params = new URLSearchParams(window.location.search);
        if (page === 1) {
            params.delete('page');
        } else {
            params.set('page', page.toString());
        }

        const newUrl = params.toString()
            ? `${pathname}?${params.toString()}`
            : pathname;

        router.push(newUrl);

        // Call optional callback
        if (onPageChange) {
            onPageChange(page);
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            // Calculate when to show leading ellipsis based on maxVisible
            const ellipsisThreshold = Math.floor(maxVisible / 2) + 1;
            if (currentPage > ellipsisThreshold) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // Calculate when to show trailing ellipsis
            if (currentPage < totalPages - ellipsisThreshold + 1) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) {
        return null; // Don't show pagination if there's only one page
    }

    return (
        <div className="flex items-center justify-center gap-1 py-8 sm:gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 sm:gap-2">
                {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="text-muted-foreground px-1 sm:px-2"
                            >
                                ...
                            </span>
                        );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;

                    return (
                        <Button
                            key={pageNum}
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            aria-label={`Page ${pageNum}`}
                            aria-current={isActive ? 'page' : undefined}
                            className="h-8 min-w-[2rem] px-2 text-sm sm:h-9 sm:min-w-[2.5rem] sm:px-3"
                        >
                            {pageNum}
                        </Button>
                    );
                })}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}

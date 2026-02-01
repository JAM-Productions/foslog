'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/button/button';
import { useMediaQuery } from '@/hooks/use-media-query';

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
    const isMobile = useMediaQuery('(max-width: 640px)');

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
        const maxVisible = isMobile ? 5 : 7; // Responsive number of page buttons

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
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
        <div
            className="flex items-center justify-center gap-2 py-8"
            aria-label="pagination"
        >
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="text-muted-foreground px-2"
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
                            className="min-w-[2.5rem]"
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
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}

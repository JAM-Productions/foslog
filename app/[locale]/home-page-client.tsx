'use client';

import React, { useMemo } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useAppStore } from '@/lib/store';
import MediaCard from '@/components/media/media-card';
import { Button } from '@/components/button/button';
import { TrendingUp, Clock, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/auth-provider';
import { SafeMediaItem } from '@/lib/types';
import Pagination from '@/components/pagination/pagination';

export default function HomePageClient({
    mediaItems: initialMediaItems,
    total,
    currentPage,
    pageSize,
    selectedMediaType,
    searchQuery,
    globalStats,
}: {
    mediaItems: SafeMediaItem[];
    total: number;
    currentPage: number;
    pageSize: number;
    selectedMediaType: string;
    searchQuery: string;
    globalStats: {
        topRated: number;
        recentlyAdded: number;
    };
}) {
    const t = useTranslations('HomePage');
    const tMediaTypes = useTranslations('MediaTypes');
    const tStats = useTranslations('Stats');
    const tSearch = useTranslations('Search');
    const tCTA = useTranslations('CTA');
    const router = useRouter();
    const { setIsReviewModalOpen } = useAppStore();
    const { user } = useAuth();

    const getTypeDisplayName = (type: string) => {
        switch (type) {
            case 'film':
                return tMediaTypes('films');
            case 'series':
                return tMediaTypes('series');
            case 'game':
                return tMediaTypes('games');
            case 'book':
                return tMediaTypes('books');
            case 'music':
                return tMediaTypes('music');
            default:
                return tMediaTypes('all');
        }
    };

    const SectionHeader = ({
        title,
        subtitle,
        icon: Icon,
    }: {
        title: string;
        subtitle: string;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    }) => (
        <div className="mb-6 flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
                <Icon className="text-primary h-5 w-5" />
            </div>
            <div>
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                <p className="text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    );

    const totalPages = useMemo(
        () => Math.ceil(total / pageSize),
        [total, pageSize]
    );

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-2 sm:items-start sm:p-4">
                    <div className="text-primary mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            {tStats('topRated')}
                        </span>
                    </div>
                    <p className="text-2xl font-bold">
                        {globalStats.topRated.toFixed(1)}
                    </p>
                    <p className="text-muted-foreground hidden text-xs sm:block">
                        {tStats('highestRatedInCollection')}
                    </p>
                </div>

                <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-2 sm:items-start sm:p-4">
                    <div className="text-primary mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            {tStats('totalItems')}
                        </span>
                    </div>
                    <p className="text-2xl font-bold">{total}</p>
                    <p className="text-muted-foreground hidden text-xs sm:block">
                        {selectedMediaType === 'all'
                            ? tStats('allMediaTypes')
                            : getTypeDisplayName(selectedMediaType)}
                    </p>
                </div>

                <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-2 sm:items-start sm:p-4">
                    <div className="text-primary mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            {tStats('recentlyAdded')}
                        </span>
                    </div>
                    <p className="text-2xl font-bold">
                        {globalStats.recentlyAdded}
                    </p>
                    <p className="text-muted-foreground hidden text-xs sm:block">
                        {tStats('fromLastMonth')}
                    </p>
                </div>
            </div>

            {/* Media Grid Section */}
            <div className="mb-8">
                <SectionHeader
                    title={
                        searchQuery
                            ? tSearch('searchResults')
                            : tSearch('trending', {
                                  mediaType:
                                      getTypeDisplayName(selectedMediaType),
                              })
                    }
                    subtitle={
                        searchQuery
                            ? tSearch('resultsFor', {
                                  count: initialMediaItems.length,
                                  query: searchQuery,
                              })
                            : tSearch('popularWith', {
                                  mediaType:
                                      selectedMediaType === 'all'
                                          ? t('media')
                                          : getTypeDisplayName(
                                                selectedMediaType
                                            ),
                              })
                    }
                    icon={searchQuery ? TrendingUp : Star}
                />

                {initialMediaItems.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                            <span className="text-2xl">🔍</span>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">
                            {tSearch('noResultsFound')}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery
                                ? tSearch('noMediaFound', {
                                      mediaType:
                                          selectedMediaType === 'all'
                                              ? t('media')
                                              : getTypeDisplayName(
                                                    selectedMediaType
                                                ),
                                      query: searchQuery,
                                  })
                                : tSearch('noMediaAvailable', {
                                      mediaType:
                                          selectedMediaType === 'all'
                                              ? t('media')
                                              : getTypeDisplayName(
                                                    selectedMediaType
                                                ),
                                  })}
                        </p>
                        {searchQuery && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    router.push('/');
                                }}
                            >
                                {tSearch('clearSearch')}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {initialMediaItems.map((media) => (
                            <Link
                                key={media.id}
                                href={`/media/${media.id}`}
                            >
                                <MediaCard media={media} />
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {initialMediaItems.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                )}
            </div>

            {/* Add CTA for more content */}
            <div className="border-t py-8 text-center">
                <h3 className="mb-2 text-lg font-semibold">
                    {tCTA('addReviewsTitle')}
                </h3>
                <p className="text-muted-foreground mb-4">
                    {tCTA('addReviewsDescription')}
                </p>
                <Button
                    onClick={() =>
                        !user
                            ? router.push('/login')
                            : setIsReviewModalOpen(true)
                    }
                >
                    {tCTA('addNewReview')}
                </Button>
            </div>
        </div>
    );
}

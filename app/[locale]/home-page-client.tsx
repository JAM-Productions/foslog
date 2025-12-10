'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import MediaCard from '@/components/media/media-card';
import { Button } from '@/components/button/button';
import { TrendingUp, Clock, Star, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { SafeMediaItem } from '@/lib/types';
import Pagination from '@/components/pagination/pagination';
import { getMedias } from '@/app/actions/media';
import { useMediaQuery } from '@/hooks/use-media-query';

export default function HomePageClient({
    searchParams,
}: {
    searchParams: { page?: string | undefined };
}) {
    const t = useTranslations('HomePage');
    const tMediaTypes = useTranslations('MediaTypes');
    const tGenres = useTranslations('MediaGenres');
    const tStats = useTranslations('Stats');
    const tSearch = useTranslations('Search');
    const tCTA = useTranslations('CTA');
    const router = useRouter();
    const { selectedMediaType, searchQuery, setIsReviewModalOpen } =
        useAppStore();
    const { user } = useAuth();

    const [mediaItems, setMediaItems] = useState<SafeMediaItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isMobile = useMediaQuery('(max-width: 768px)');
    const pageSize = isMobile ? 8 : 12;
    const currentPage = Number(searchParams.page) || 1;

    useEffect(() => {
        const fetchMedia = async () => {
            setLoading(true);
            setError(null);
            try {
                const { items, total } = await getMedias(currentPage, pageSize);
                setMediaItems(items);
                setTotal(total);
            } catch (err) {
                console.error('Failed to fetch media:', err);
                setError(t('error'));
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, [currentPage, pageSize, t]);

    const filteredMedia = useMemo(() => {
        let filtered = mediaItems;

        // Filter by media type
        if (selectedMediaType !== 'all') {
            filtered = filtered.filter(
                (item) => item.type === selectedMediaType
            );
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    item.genre.some((g) =>
                        tGenres(g).toLowerCase().includes(query)
                    ) ||
                    item.director?.toLowerCase().includes(query) ||
                    item.author?.toLowerCase().includes(query) ||
                    item.artist?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [mediaItems, selectedMediaType, searchQuery, tGenres]);

    const sortedMedia = useMemo(() => {
        return [...filteredMedia].sort((a, b) => {
            if (a.averageRating !== b.averageRating) {
                return b.averageRating - a.averageRating;
            }
            return b.totalReviews - a.totalReviews;
        });
    }, [filteredMedia]);

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

    const currentYear = useMemo(() => new Date().getFullYear(), []);
    const totalPages = useMemo(
        () => Math.ceil(total / pageSize),
        [total, pageSize]
    );

    if (loading) {
        return (
            <div className="container mx-auto animate-pulse px-4 py-8">
                {/* Stats Cards Skeleton */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="bg-muted h-28 rounded-lg"></div>
                    <div className="bg-muted h-28 rounded-lg"></div>
                    <div className="bg-muted h-28 rounded-lg"></div>
                </div>
                {/* Media Grid Skeleton */}
                <div className="mb-8">
                    <div className="bg-muted mb-6 h-16 w-1/2 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {[...Array(pageSize)].map((_, i) => (
                            <div key={i} className="bg-muted h-64 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto flex h-screen flex-col items-center justify-center px-4 py-8">
                <AlertCircle className="text-destructive h-12 w-12" />
                <h2 className="mt-4 text-2xl font-bold">{t('errorTitle')}</h2>
                <p className="text-muted-foreground mt-2">{error}</p>
                <Button className="mt-6" onClick={() => window.location.reload()}>
                    {t('retry')}
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="bg-card rounded-lg border p-4">
                    <div className="text-primary mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            {tStats('topRated')}
                        </span>
                    </div>
                    <p className="text-2xl font-bold">
                        {filteredMedia.length > 0
                            ? Math.max(
                                  ...filteredMedia.map((m) => m.averageRating)
                              ).toFixed(1)
                            : '0'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                        {tStats('highestRatedInCollection')}
                    </p>
                </div>

                <div className="bg-card rounded-lg border p-4">
                    <div className="text-primary mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            {tStats('totalItems')}
                        </span>
                    </div>
                    <p className="text-2xl font-bold">{filteredMedia.length}</p>
                    <p className="text-muted-foreground text-xs">
                        {selectedMediaType === 'all'
                            ? tStats('allMediaTypes')
                            : getTypeDisplayName(selectedMediaType)}
                    </p>
                </div>

                <div className="bg-card rounded-lg border p-4">
                    <div className="text-primary mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            {tStats('recentlyAdded')}
                        </span>
                    </div>
                    <p className="text-2xl font-bold">
                        {
                            sortedMedia.filter(
                                (m) => m.year && m.year >= currentYear
                            ).length
                        }
                    </p>
                    <p className="text-muted-foreground text-xs">
                        {tStats('fromDateOnwards', {
                            date: currentYear,
                        })}
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
                                  count: sortedMedia.length,
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

                {sortedMedia.length === 0 ? (
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
                                onClick={() =>
                                    useAppStore.getState().setSearchQuery('')
                                }
                            >
                                {tSearch('clearSearch')}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {sortedMedia.map((media) => (
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
                {sortedMedia.length > 0 && totalPages > 1 && (
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

'use client';

import React, { useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { mockMediaItems, mockReviews } from '@/lib/mock-data';
import MediaCard from '@/components/media-card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth-provider';

export default function HomePage() {
    const t = useTranslations('HomePage');
    const tMediaTypes = useTranslations('MediaTypes');
    const tStats = useTranslations('Stats');
    const tSearch = useTranslations('Search');
    const tCTA = useTranslations('CTA');
    const {
        mediaItems,
        setMediaItems,
        setReviews,
        selectedMediaType,
        searchQuery,
    } = useAppStore();
    const { user } = useAuth();

    // Initialize with mock data
    useEffect(() => {
        if (mediaItems.length === 0) {
            setMediaItems(mockMediaItems);
            setReviews(mockReviews);
        }
    }, [mediaItems.length, setMediaItems, setReviews]);

    // Filter and search media items
    const filteredMedia = useMemo(() => {
        let filtered = mediaItems;

        // Filter by media type
        if (selectedMediaType !== 'all') {
            filtered = filtered.filter(
                (item) => item.type === selectedMediaType
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.title.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    item.genre.some((g) => g.toLowerCase().includes(query)) ||
                    item.director?.toLowerCase().includes(query) ||
                    item.author?.toLowerCase().includes(query) ||
                    item.artist?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [mediaItems, selectedMediaType, searchQuery]);

    // Sort options
    const sortedMedia = useMemo(() => {
        return [...filteredMedia].sort((a, b) => {
            // Default sort by average rating (highest first), then by total reviews
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

    const currentYear = new Date().getFullYear();

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Welcome Section */}
            {user && (
                <div className="mb-12">
                    <h1 className="mb-2 text-3xl font-bold tracking-tight">
                        {t('welcomeBack', { name: user.name })}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('discover', {
                            mediaType:
                                selectedMediaType === 'all'
                                    ? t('media')
                                    : tMediaTypes(selectedMediaType),
                        })}
                    </p>
                </div>
            )}
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
                                          : tMediaTypes(selectedMediaType),
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
                                              : tMediaTypes(selectedMediaType),
                                      query: searchQuery,
                                  })
                                : tSearch('noMediaAvailable', {
                                      mediaType:
                                          selectedMediaType === 'all'
                                              ? t('media')
                                              : tMediaTypes(selectedMediaType),
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
                            <MediaCard
                                key={media.id}
                                media={media}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add CTA for more content */}
            {sortedMedia.length > 0 && (
                <div className="border-t py-8 text-center">
                    <h3 className="mb-2 text-lg font-semibold">
                        {tCTA('addReviewsTitle')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                        {tCTA('addReviewsDescription')}
                    </p>
                    <Button>{tCTA('addNewReview')}</Button>
                </div>
            )}
        </div>
    );
}

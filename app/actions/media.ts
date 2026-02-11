'use server';

import { logger } from '@/lib/axiom/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { MediaType, User } from '@/lib/store';
import {
    SafeMediaItem,
    SafeMediaItemWithReviews,
    SafeReview,
} from '@/lib/types';
import { Prisma, MediaType as PrismaMediaType } from '@prisma/client';

export const getMedias = async (
    page: number = 1,
    pageSize: number = 12,
    mediaType?: string,
    searchQuery?: string
): Promise<{ items: SafeMediaItem[]; total: number }> => {
    return { items: [], total: 0 };
    try {
        const skip = (page - 1) * pageSize;

        const where: Prisma.MediaItemWhereInput = {};

        if (mediaType && mediaType !== 'all') {
            where.type = mediaType.toUpperCase() as PrismaMediaType;
        }

        if (searchQuery && searchQuery.trim()) {
            where.OR = [
                { title: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
                { director: { contains: searchQuery, mode: 'insensitive' } },
                { author: { contains: searchQuery, mode: 'insensitive' } },
                { artist: { contains: searchQuery, mode: 'insensitive' } },
                {
                    genre: {
                        hasSome: [
                            searchQuery,
                            searchQuery.toUpperCase(),
                            searchQuery.charAt(0).toUpperCase() +
                                searchQuery.slice(1),
                        ],
                    },
                },
            ];
        }

        const [mediaItems, total] = await prisma.$transaction([
            prisma.mediaItem.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: [
                    { averageRating: 'desc' },
                    { totalReviews: 'desc' },
                    { id: 'asc' },
                ],
            }),
            prisma.mediaItem.count({ where }),
        ]);

        // Explicitly map to SafeMediaItem to avoid extra properties from Prisma model
        const items = mediaItems.map((item) => ({
            id: item.id,
            title: item.title,
            type: item.type.toLowerCase() as MediaType,
            year: item.year ?? undefined,
            director: item.director ?? undefined,
            author: item.author ?? undefined,
            artist: item.artist ?? undefined,
            genre: item.genre,
            poster: item.poster ?? undefined,
            cover: item.cover ?? undefined,
            description: item.description,
            averageRating: item.averageRating,
            totalReviews: item.totalReviews,
            totalLikes: item.totalLikes,
            totalDislikes: item.totalDislikes,
        }));

        logger.info('GET /actions/media', {
            method: 'getMedias',
            total,
            page,
            mediaType,
            searchQuery,
        });
        return { items, total };
    } catch (error) {
        logger.error('GET /actions/media', {
            method: 'getMedias',
            error,
            page,
            mediaType,
            searchQuery,
        });
        throw new Error('Could not fetch media items.');
    }
};

/**
 * Lightweight function to fetch only the media title for metadata generation
 * Avoids expensive review queries when only basic info is needed
 */
export const getMediaMetadata = async (
    id: string
): Promise<{ title: string } | null> => {
    try {
        const mediaItem = await prisma.mediaItem.findUnique({
            where: { id },
            select: {
                title: true,
            },
        });

        if (!mediaItem) {
            logger.warn('GET /actions/media', {
                method: 'getMediaMetadata',
                warn: 'Media not found',
                mediaId: id,
            });
            return null;
        }

        logger.info('GET /actions/media', {
            method: 'getMediaMetadata',
            mediaId: id,
        });
        return {
            title: mediaItem.title,
        };
    } catch (error) {
        logger.error('GET /actions/media', {
            method: 'getMediaMetadata',
            error,
            mediaId: id,
        });
        return null;
    }
};

export const getMediaById = async (
    id: string,
    page: number = 1,
    pageSize: number = 5
): Promise<SafeMediaItemWithReviews | null> => {
    try {
        const skip = (page - 1) * pageSize;

        const mediaItem = await prisma.mediaItem.findUnique({
            where: { id },
        });

        if (!mediaItem) {
            logger.warn('GET /actions/media', {
                method: 'getMediaById',
                warn: 'Media not found',
                mediaId: id,
            });
            return null;
        }

        const reviews = await prisma.review.findMany({
            where: { mediaId: id },
            include: { user: true },
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
        });

        const safeReviews: SafeReview[] = reviews.map((review) => {
            const { user, ...restOfReview } = review;

            const safeUser: User = {
                id: user.id,
                name: user.name ?? 'Unknown User',
                email: user.email,
                image: user.image ?? undefined,
                bio: user.bio ?? undefined,
                joinedAt: user.createdAt,
            };

            return {
                id: restOfReview.id,
                mediaId: restOfReview.mediaId,
                userId: restOfReview.userId,
                rating: restOfReview.rating ?? undefined,
                liked: restOfReview.liked ?? undefined,
                review: restOfReview.review ?? undefined,
                createdAt: restOfReview.createdAt,
                updatedAt: restOfReview.updatedAt,
                consumedMoreThanOnce: restOfReview.consumedMoreThanOnce,
                totalComments: restOfReview.totalComments,
                user: safeUser,
            };
        });

        const totalPages = Math.ceil(mediaItem.totalReviews / pageSize);

        logger.info('GET /actions/media', {
            method: 'getMediaById',
            mediaId: id,
        });
        return {
            id: mediaItem.id,
            title: mediaItem.title,
            type: mediaItem.type.toLowerCase() as MediaType,
            year: mediaItem.year ?? undefined,
            director: mediaItem.director ?? undefined,
            author: mediaItem.author ?? undefined,
            artist: mediaItem.artist ?? undefined,
            genre: mediaItem.genre,
            poster: mediaItem.poster ?? undefined,
            cover: mediaItem.cover ?? undefined,
            description: mediaItem.description,
            averageRating: mediaItem.averageRating,
            totalReviews: mediaItem.totalReviews,
            totalLikes: mediaItem.totalLikes,
            totalDislikes: mediaItem.totalDislikes,
            reviews: safeReviews,
            totalPages,
            currentPage: page,
        };
    } catch (error) {
        logger.error('GET /actions/media', {
            method: 'getMediaById',
            error,
            mediaId: id,
        });
        throw new Error('Could not fetch media item.');
    }
};

export const getGlobalMediaStats = async (): Promise<{
    topRated: number;
    recentlyAdded: number;
}> => {
    return { topRated: 0, recentlyAdded: 0 };
    const CACHE_KEY = 'global:media:stats';
    const CACHE_TTL = 86400; // 1 day

    try {
        const cachedStats = await redis.get(CACHE_KEY);
        if (cachedStats) {
            const parsed = JSON.parse(cachedStats);
            logger.info('GET /actions/media', {
                method: 'getGlobalMediaStats',
                cached: true,
                topRated: parsed.topRated,
                recentlyAdded: parsed.recentlyAdded,
            });
            return parsed;
        }
    } catch (cacheError) {
        logger.warn('GET /actions/media', {
            method: 'getGlobalMediaStats',
            cacheReadFailed: true,
            error: cacheError,
            message: 'Redis read failed, falling back to database',
        });
    }

    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const [topRatedResult, recentlyAddedResult] = await prisma.$transaction(
            [
                prisma.mediaItem.aggregate({
                    _max: {
                        averageRating: true,
                    },
                }),
                prisma.mediaItem.count({
                    where: {
                        createdAt: {
                            gte: oneMonthAgo,
                        },
                    },
                }),
            ]
        );

        const stats = {
            topRated: topRatedResult._max.averageRating ?? 0,
            recentlyAdded: recentlyAddedResult,
        };

        try {
            await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(stats));
        } catch (cacheError) {
            logger.error('GET /actions/media', {
                method: 'getGlobalMediaStats',
                cacheWriteFailed: true,
                error: cacheError,
            });
        }

        logger.info('GET /actions/media', {
            method: 'getGlobalMediaStats',
            cached: false,
            topRated: stats.topRated,
            recentlyAdded: stats.recentlyAdded,
        });
        return stats;
    } catch (error) {
        logger.error('GET /actions/media', {
            method: 'getGlobalMediaStats',
            error,
            topRated: 0,
            recentlyAdded: 0,
        });
        throw new Error('Could not fetch global media stats.');
    }
};

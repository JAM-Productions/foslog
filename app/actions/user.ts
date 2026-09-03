'use server';

import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import { prisma } from '@/lib/prisma';
import { LIST_MEDIA_PAGE_SIZE, LISTS_PREVIEW_LIMIT } from '@/lib/constants';
import { MediaType, User } from '@/lib/store';
import {
    SafeMediaList,
    SafeMediaListPreview,
    SafeReviewWithMedia,
} from '@/lib/types';
import { ListType, Prisma, MediaType as PrismaMediaType } from '@prisma/client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { toSafeReviewWithMedia } from '@/utils/review-utils';

export const getUserProfile = async (userId: string): Promise<User | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            logger.warn('GET /actions/user', {
                method: 'getUserProfile',
                warn: 'User not found',
                userId,
            });
            return null;
        }

        logger.info('GET /actions/user', {
            method: 'getUserProfile',
            userId,
        });
        return {
            id: user.id,
            name: user.name ?? 'Unknown User',
            email: '', // Don't expose email for profile view
            image: user.image ?? undefined,
            bio: user.bio ?? undefined,
            joinedAt: user.createdAt,
            totalFollowers: user.totalFollowers ?? 0,
            totalFollowing: user.totalFollowing ?? 0,
        };
    } catch (error) {
        logger.error('GET /actions/user', {
            method: 'getUserProfile',
            error,
            userId,
        });
        throw new Error('Could not fetch user profile.');
    }
};

export const getUserReviews = async (
    userId: string,
    page: number = 1,
    pageSize: number = 12
): Promise<{
    reviews: SafeReviewWithMedia[];
    total: number;
    totalPages: number;
    currentPage: number;
}> => {
    try {
        const skip = (page - 1) * pageSize;

        const [reviews, total] = await prisma.$transaction([
            prisma.review.findMany({
                where: { userId },
                include: {
                    media: true,
                    user: true,
                },
                orderBy: { consumedDate: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma.review.count({
                where: { userId },
            }),
        ]);

        const totalPages = Math.ceil(total / pageSize);

        const safeReviews = reviews.map(toSafeReviewWithMedia);

        logger.info('GET /actions/user', {
            method: 'getUserReviews',
            userId,
            total,
            currentPage: page,
        });
        return {
            reviews: safeReviews,
            total,
            totalPages,
            currentPage: page,
        };
    } catch (error) {
        logger.error('GET /actions/user', {
            method: 'getUserReviews',
            error,
            userId,
        });
        throw new Error('Could not fetch user reviews.');
    }
};

/** Media types shown in the profile breakdown, most reviewed first. */
const MEDIA_TYPE_BREAKDOWN_LIMIT = 3;

export interface UserStats {
    totalReviews: number;
    totalLikesReceived: number;
    totalLikesGiven: number;
    totalDislikesGiven: number;
    averageRating: number;
    activityYear: number;
    reviewsThisYear: number;
    lastReviewAt: Date | null;
    mediaTypeBreakdown: { type: MediaType; count: number }[];
    ratingDistribution: Record<number, number>;
    favoriteGenres: { genre: string; count: number }[];
}

export const getUserStats = async (userId: string): Promise<UserStats> => {
    try {
        const reviews = await prisma.review.findMany({
            where: { userId },
            include: {
                media: true,
            },
        });

        const totalReviews = reviews.length;
        const totalLikesReceived = reviews.reduce(
            (acc, review) => acc + (review.totalLikes ?? 0),
            0
        );

        const totalLikesGiven = reviews.filter((r) => r.liked === true).length;
        const totalDislikesGiven = reviews.filter(
            (r) => r.liked === false
        ).length;

        const ratedReviews = reviews.filter((r) => r.rating !== null);
        const averageRating =
            ratedReviews.length > 0
                ? ratedReviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
                  ratedReviews.length
                : 0;

        const ratingDistribution: Record<number, number> = {};
        ratedReviews.forEach((r) => {
            const rating = r.rating || 0;
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
        });

        const genreCounts: Record<string, number> = {};
        reviews.forEach((r) => {
            r.media.genre.forEach((g) => {
                genreCounts[g] = (genreCounts[g] || 0) + 1;
            });
        });

        const favoriteGenres = Object.entries(genreCounts)
            .map(([genre, count]) => ({ genre, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const typeCounts: Record<string, number> = {};
        reviews.forEach((r) => {
            const type = r.media.type.toLowerCase();
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        const mediaTypeBreakdown = Object.entries(typeCounts)
            .map(([type, count]) => ({ type: type as MediaType, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, MEDIA_TYPE_BREAKDOWN_LIMIT);

        const consumedDates = reviews
            .map((r) => r.consumedDate ?? r.createdAt)
            .filter((d): d is Date => d instanceof Date && !isNaN(d.getTime()));

        const activityYear = new Date().getFullYear();
        const reviewsThisYear = consumedDates.filter(
            (d) => d.getFullYear() === activityYear
        ).length;

        const lastReviewAt = consumedDates.length
            ? new Date(Math.max(...consumedDates.map((d) => d.getTime())))
            : null;

        logger.info('GET /actions/user', {
            method: 'getUserStats',
            userId,
            totalReviews,
            totalLikesReceived,
            totalLikesGiven,
            totalDislikesGiven,
            averageRating,
            reviewsThisYear,
            mediaTypeBreakdown,
            ratingDistribution,
            favoriteGenres,
        });
        return {
            totalReviews,
            totalLikesReceived,
            totalLikesGiven,
            totalDislikesGiven,
            averageRating,
            activityYear,
            reviewsThisYear,
            lastReviewAt,
            mediaTypeBreakdown,
            ratingDistribution,
            favoriteGenres,
        };
    } catch (error) {
        logger.error('GET /actions/user', {
            method: 'getUserStats',
            error,
            userId,
        });
        throw new Error('Could not fetch user stats.');
    }
};

export const isFollowedByCurrentUser = async (
    targetUserId: string
): Promise<boolean> => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        const currentUserId = session?.user?.id;

        if (!currentUserId) {
            logger.warn('GET /actions/user', {
                method: 'isFollowedByCurrentUser',
                warn: 'No authenticated user',
                targetUserId,
            });
            return false;
        }

        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId,
                },
            },
        });

        logger.info('GET /actions/user', {
            method: 'isFollowedByCurrentUser',
            currentUserId,
            targetUserId,
            isFollowing: !!follow,
        });
        return !!follow;
    } catch (error) {
        logger.error('GET /actions/user', {
            method: 'isFollowedByCurrentUser',
            error,
            targetUserId,
        });
        throw new Error('Could not determine follow status.');
    }
};

export const hasUserReviewed = async (
    mediaId: string,
    userId?: string
): Promise<boolean> => {
    try {
        const currentUserId =
            userId ??
            (await auth.api.getSession({ headers: await headers() }))?.user?.id;

        if (!currentUserId) return false;

        const count = await prisma.review.count({
            where: { mediaId, userId: currentUserId },
        });

        logger.info('GET /actions/user', {
            method: 'hasUserReviewed',
            mediaId,
            userId: currentUserId,
            hasReviewed: count > 0,
        });

        return count > 0;
    } catch (error) {
        logger.error('GET /actions/user', {
            method: 'hasUserReviewed',
            error,
            mediaId,
        });
        throw new Error('Could not determine review status.');
    }
};

export const hasUserBookmarked = async (
    mediaId: string,
    userId?: string
): Promise<boolean> => {
    try {
        const currentUserId =
            userId ??
            (await auth.api.getSession({ headers: await headers() }))?.user?.id;

        if (!currentUserId) return false;

        const bookmarkList = await prisma.list.findFirst({
            where: { userId: currentUserId, type: ListType.BOOKMARK },
        });

        if (!bookmarkList) return false;

        const bookmark = await prisma.listMediaItem.findUnique({
            where: {
                listId_mediaId: {
                    listId: bookmarkList.id,
                    mediaId,
                },
            },
        });

        logger.info('GET /actions/user', {
            method: 'hasUserBookmarked',
            mediaId,
            userId: currentUserId,
            hasBookmarked: !!bookmark,
        });

        return !!bookmark;
    } catch (error) {
        logger.error('GET /actions/user', {
            method: 'hasUserBookmarked',
            error,
            mediaId,
        });
        throw new Error('Could not determine bookmark status.');
    }
};

/**
 * Owners see everything. Everyone else only sees lists explicitly made
 * public; bookmark lists are managed by the app and are never public.
 */
const buildVisibleListsWhereClause = async (userId: string) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    const currentUserId = session?.user?.id;

    return currentUserId === userId
        ? { userId }
        : { userId, type: ListType.LIST, isPublic: true };
};

const LIST_SUMMARY_SELECT = {
    id: true,
    name: true,
    image: true,
    type: true,
    _count: {
        select: { mediaItems: true },
    },
} as const;

// The `ListType` enum declares BOOKMARK first, so ascending order puts the
// bookmark list at the front of every listing.
const LIST_SUMMARY_ORDER_BY = [
    { type: 'asc' as const },
    { createdAt: 'desc' as const },
];

type ListSummaryRow = {
    id: string;
    name: string;
    image: string | null;
    type: ListType;
    _count: { mediaItems: number };
};

const toSafeMediaList = (list: ListSummaryRow): SafeMediaList => ({
    id: list.id,
    name: list.name,
    image: list.image ?? undefined,
    type: list.type,
    totalItems: list._count.mediaItems,
});

export const getUserMediaLists = async (
    userId: string,
    limit: number = LISTS_PREVIEW_LIMIT
): Promise<SafeMediaListPreview> => {
    try {
        const whereClause = await buildVisibleListsWhereClause(userId);

        const [lists, total] = await prisma.$transaction([
            prisma.list.findMany({
                where: whereClause,
                select: LIST_SUMMARY_SELECT,
                orderBy: LIST_SUMMARY_ORDER_BY,
                take: limit,
            }),
            prisma.list.count({ where: whereClause }),
        ]);

        logger.info('GET /actions/user', {
            method: 'getUserMediaLists',
            userId,
            listCount: lists.length,
            total,
        });

        return {
            lists: (lists as ListSummaryRow[]).map(toSafeMediaList),
            total,
        };
    } catch (error) {
        logger.error('GET /actions/user', {
            method: 'getUserMediaLists',
            error,
            userId,
        });
        throw new Error('Could not fetch user media lists.');
    }
};

/**
 * Every list visible to the viewer. Capped per user by MAX_LISTS_PER_USER,
 * so the whole set is safe to render in one go.
 */
export const getAllUserLists = async (
    userId: string
): Promise<SafeMediaList[]> => {
    try {
        const whereClause = await buildVisibleListsWhereClause(userId);

        const lists = await prisma.list.findMany({
            where: whereClause,
            select: LIST_SUMMARY_SELECT,
            orderBy: LIST_SUMMARY_ORDER_BY,
        });

        logger.info('GET /actions/user', {
            method: 'getAllUserLists',
            userId,
            total: lists.length,
        });

        return (lists as ListSummaryRow[]).map(toSafeMediaList);
    } catch (error) {
        logger.error('GET /actions/user', {
            method: 'getAllUserLists',
            error,
            userId,
        });
        throw new Error('Could not fetch user lists.');
    }
};

export const getOtherUserLists = async (
    userId: string,
    excludeListId: string,
    limit: number = LISTS_PREVIEW_LIMIT
): Promise<SafeMediaListPreview> => {
    try {
        const visibleWhereClause = await buildVisibleListsWhereClause(userId);
        const whereClause = {
            ...visibleWhereClause,
            id: { not: excludeListId },
        };

        const [lists, total] = await prisma.$transaction([
            prisma.list.findMany({
                where: whereClause,
                select: LIST_SUMMARY_SELECT,
                orderBy: LIST_SUMMARY_ORDER_BY,
                take: limit,
            }),
            prisma.list.count({ where: whereClause }),
        ]);

        logger.info('GET /actions/user', {
            method: 'getOtherUserLists',
            userId,
            excludeListId,
            total,
        });

        return {
            lists: (lists as ListSummaryRow[]).map(toSafeMediaList),
            total,
        };
    } catch (error) {
        logger.error('GET /actions/user', {
            method: 'getOtherUserLists',
            error,
            userId,
            excludeListId,
        });
        throw new Error('Could not fetch other user lists.');
    }
};

export const getUserMediaListData = async (
    userId: string,
    listId: string,
    page: number = 1,
    pageSize: number = LIST_MEDIA_PAGE_SIZE,
    query: string = '',
    mediaType?: string,
    sort: string = ''
) => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        const currentUserId = session?.user?.id;

        // Filtering happens in the database so the search spans the whole list,
        // not just the page currently on screen.
        const trimmedQuery = query.trim();
        const mediaWhere: Prisma.MediaItemWhereInput = {};

        if (trimmedQuery) {
            mediaWhere.title = {
                contains: trimmedQuery,
                mode: 'insensitive',
            };
        }

        if (mediaType && mediaType !== 'all') {
            mediaWhere.type = mediaType.toUpperCase() as PrismaMediaType;
        }

        const mediaItemsWhere =
            Object.keys(mediaWhere).length > 0
                ? { media: mediaWhere }
                : undefined;

        // Items without a release year always sink to the bottom, whichever
        // way the year column is sorted.
        const mediaItemsOrderBy: Prisma.ListMediaItemOrderByWithRelationInput[] =
            sort === 'year-desc'
                ? [
                      { media: { year: { sort: 'desc', nulls: 'last' } } },
                      { createdAt: 'desc' },
                  ]
                : sort === 'year-asc'
                  ? [
                        { media: { year: { sort: 'asc', nulls: 'last' } } },
                        { createdAt: 'desc' },
                    ]
                  : sort === 'added-asc'
                    ? [{ createdAt: 'asc' }]
                    : [{ createdAt: 'desc' }];

        const list = await prisma.list.findFirst({
            where: {
                id: listId,
                userId,
            },
            include: {
                user: true,
                _count: {
                    select: { mediaItems: true },
                },
                mediaItems: {
                    where: mediaItemsWhere,
                    include: {
                        media: true,
                    },
                    orderBy: mediaItemsOrderBy,
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                },
            },
        });

        if (!list) {
            logger.warn('GET /actions/user', {
                method: 'getUserMediaListData',
                warn: 'List not found',
                userId,
                listId,
            });
            return null;
        }

        // Only the owner reaches a bookmark list or a list left private.
        const isVisibleToViewer =
            currentUserId === userId ||
            (list.type === ListType.LIST && list.isPublic);

        if (!isVisibleToViewer) {
            logger.warn('GET /actions/user', {
                method: 'getUserMediaListData',
                warn: 'Cannot access a list that is not public',
                userId,
                listId,
                currentUserId,
            });
            redirect(`/profile/${userId}`);
        }

        // The header always shows the list size; pagination follows the
        // filtered set, so a search only needs its own count.
        const totalItems = list._count.mediaItems;
        const matchingItems = mediaItemsWhere
            ? await prisma.listMediaItem.count({
                  where: { listId, ...mediaItemsWhere },
              })
            : totalItems;

        logger.info('GET /actions/user', {
            method: 'getUserMediaListData',
            userId,
            listId,
            mediaCount: list.mediaItems.length,
            totalItems,
            matchingItems,
            currentPage: page,
        });
        return {
            id: list.id,
            name: list.name,
            description: list.description ?? undefined,
            image: list.image ?? undefined,
            type: list.type,
            isPublic: list.isPublic,
            totalItems,
            matchingItems,
            totalPages: Math.ceil(matchingItems / pageSize),
            currentPage: page,
            user: {
                id: list.user.id,
                name: list.user.name ?? 'Unknown User',
                image: list.user.image ?? undefined,
            },
            mediaItems: list.mediaItems.map((item) => ({
                id: item.id,
                mediaId: item.mediaId,
                createdAt: item.createdAt,
                media: {
                    id: item.media.id,
                    title: item.media.title,
                    type: item.media.type.toLowerCase() as MediaType,
                    year: item.media.year ?? undefined,
                    poster: item.media.poster ?? undefined,
                },
            })),
        };
    } catch (error) {
        logger.error('GET /actions/user', {
            method: 'getUserMediaListData',
            error,
            userId,
            listId,
        });

        throw new Error('Could not fetch user media list data.');
    }
};

export const getUserListMetadata = async (listId: string) => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        const currentUserId = session?.user?.id;

        const list = await prisma.list.findUnique({
            where: { id: listId },
            select: {
                id: true,
                name: true,
                type: true,
                userId: true,
                isPublic: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!list) {
            logger.warn('GET /actions/user', {
                method: 'getUserListMetadata',
                warn: 'List not found',
                listId,
            });
            return null;
        }

        // A private list must not leak its name through page metadata either.
        const isVisibleToViewer =
            currentUserId === list.userId ||
            (list.type === ListType.LIST && list.isPublic);

        if (!isVisibleToViewer) {
            logger.warn('GET /actions/user', {
                method: 'getUserListMetadata',
                warn: 'Cannot access metadata for a list that is not public',
                listId,
                currentUserId,
            });
            return null;
        }

        logger.info('GET /actions/user', {
            method: 'getUserListMetadata',
            listId,
        });
        return {
            id: list.id,
            name: list.name,
            user: {
                name: list.user.name ?? 'Unknown User',
            },
        };
    } catch (error) {
        logger.error('GET /actions/user', {
            method: 'getUserListMetadata',
            error,
            listId,
        });
        return null;
    }
};

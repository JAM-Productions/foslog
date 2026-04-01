'use server';

import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import { prisma } from '@/lib/prisma';
import { MediaType, User } from '@/lib/store';
import { SafeReviewWithMedia } from '@/lib/types';
import { ListType } from '@prisma/client';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

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
                orderBy: { consumedDate: 'desc' } as any,
                skip,
                take: pageSize,
            }),
            prisma.review.count({
                where: { userId },
            }),
        ]);

        const totalPages = Math.ceil(total / pageSize);

        const safeReviews = reviews.map((review) => ({
            id: review.id,
            mediaId: review.mediaId,
            userId: review.userId,
            rating: review.rating ?? undefined,
            liked: review.liked ?? undefined,
            review: review.review ?? undefined,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            consumedMoreThanOnce: review.consumedMoreThanOnce,
            consumedDate: (review as any).consumedDate ?? review.createdAt,
            totalComments: review.totalComments,
            totalLikes: review.totalLikes,
            user: {
                id: review.user.id,
                name: review.user.name ?? 'Unknown User',
                email: '', // Don't expose email
                image: review.user.image ?? undefined,
                bio: review.user.bio ?? undefined,
                joinedAt: review.user.createdAt,
                totalFollowers: review.user.totalFollowers,
                totalFollowing: review.user.totalFollowing,
            },
            media: {
                id: review.media.id,
                title: review.media.title,
                type: review.media.type.toLowerCase() as MediaType,
                year: review.media.year ?? undefined,
                director: review.media.director ?? undefined,
                author: review.media.author ?? undefined,
                artist: review.media.artist ?? undefined,
                genre: review.media.genre,
                poster: review.media.poster ?? undefined,
                cover: review.media.cover ?? undefined,
                description: review.media.description,
                averageRating: review.media.averageRating,
                totalReviews: review.media.totalReviews,
                totalLikes: review.media.totalLikes,
                totalDislikes: review.media.totalDislikes,
            },
        }));

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

export interface UserStats {
    totalReviews: number;
    totalLikesReceived: number;
    averageRating: number;
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
            (acc, review) => acc + (review.liked ? 1 : 0),
            0
        );

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

        logger.info('GET /actions/user', {
            method: 'getUserStats',
            userId,
            totalReviews,
            totalLikesReceived,
            averageRating,
            ratingDistribution,
            favoriteGenres,
        });
        return {
            totalReviews,
            totalLikesReceived,
            averageRating,
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

export const getUserMediaLists = async (userId: string) => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        const currentUserId = session?.user?.id;

        const whereClause =
            currentUserId === userId
                ? { userId }
                : { userId, type: ListType.LIST };

        const lists = await prisma.list.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                image: true,
                type: true,
            },
        });

        logger.info('GET /actions/user', {
            method: 'getUserMediaLists',
            userId,
            listCount: lists.length,
        });
        return lists.map((list) => ({
            id: list.id,
            name: list.name,
            image: list.image ?? undefined,
            type: list.type,
        }));
    } catch (error) {
        logger.error('GET /actions/user', {
            method: 'getUserMediaLists',
            error,
            userId,
        });
        throw new Error('Could not fetch user media lists.');
    }
};

export const getUserMediaListData = async (userId: string, listId: string) => {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        const currentUserId = session?.user?.id;

        const list = await prisma.list.findFirst({
            where: {
                id: listId,
                userId,
            },
            include: {
                user: true,
                mediaItems: {
                    include: {
                        media: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
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

        if (list.type === ListType.BOOKMARK && currentUserId !== userId) {
            logger.warn('GET /actions/user', {
                method: 'getUserMediaListData',
                warn: 'Cannot access other users bookmark list',
                userId,
                listId,
                currentUserId,
            });
            redirect(`/profile/${userId}`);
        }

        logger.info('GET /actions/user', {
            method: 'getUserMediaListData',
            userId,
            listId,
            mediaCount: list.mediaItems.length,
        });
        return {
            id: list.id,
            name: list.name,
            image: list.image ?? undefined,
            type: list.type,
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

        if (list.type === ListType.BOOKMARK && currentUserId !== list.userId) {
            logger.warn('GET /actions/user', {
                method: 'getUserListMetadata',
                warn: 'Cannot access other users bookmark metadata',
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

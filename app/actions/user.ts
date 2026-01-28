'use server';

import { logger } from '@/lib/axiom/server';
import { prisma } from '@/lib/prisma';
import { MediaType, User } from '@/lib/store';
import { SafeReviewWithMedia } from '@/lib/types';

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
                orderBy: { createdAt: 'desc' },
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
            totalComments: review.totalComments,
            user: {
                id: review.user.id,
                name: review.user.name ?? 'Unknown User',
                email: '', // Don't expose email
                image: review.user.image ?? undefined,
                bio: review.user.bio ?? undefined,
                joinedAt: review.user.createdAt,
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

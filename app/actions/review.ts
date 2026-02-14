'use server';

import { logger } from '@/lib/axiom/server';
import { prisma } from '@/lib/prisma';
import { User } from '@/lib/store';
import { SafeComment, SafeReviewWithComments } from '@/lib/types';

/**
 * Lightweight function to fetch only user name and media title for metadata generation
 * Avoids expensive comment queries when only basic info is needed
 */
export const getReviewMetadata = async (
    id: string
): Promise<{ userName: string; mediaTitle: string } | null> => {
    try {
        const review = await prisma.review.findUnique({
            where: { id },
            select: {
                user: {
                    select: {
                        name: true,
                    },
                },
                media: {
                    select: {
                        title: true,
                    },
                },
            },
        });

        if (!review) {
            logger.warn('GET /actions/review', {
                method: 'getReviewMetadata',
                warn: 'Review not found',
                reviewId: id,
            });
            return null;
        }

        logger.info('GET /actions/review', {
            method: 'getReviewMetadata',
            reviewId: id,
        });
        return {
            userName: review.user.name ?? 'Unknown User',
            mediaTitle: review.media.title,
        };
    } catch (error) {
        logger.error('GET /actions/review', {
            method: 'getReviewMetadata',
            error,
            reviewId: id,
        });
        return null;
    }
};

export const getReviewByIdWithComments = async (
    id: string,
    page: number = 1,
    pageSize: number = 12
): Promise<SafeReviewWithComments | null> => {
    try {
        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                user: true,
                media: true,
                comments: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                },
            },
        });

        if (!review) {
            logger.warn('GET /actions/review', {
                method: 'getReviewByIdWithComments',
                warn: 'Review not found',
                reviewId: id,
            });
            return null;
        }

        const safeUser: User = {
            id: review.user.id,
            name: review.user.name ?? 'Unknown User',
            email: '',
            image: review.user.image ?? undefined,
            bio: undefined,
            joinedAt: review.user.createdAt,
            totalFollowers: review.user.totalFollowers,
            totalFollowing: review.user.totalFollowing,
        };

        const safeComments: SafeComment[] = review.comments.map((comment) => {
            const safeUser: User = {
                id: comment.user.id,
                name: comment.user.name ?? 'Unknown User',
                email: '',
                image: comment.user.image ?? undefined,
                bio: undefined,
                joinedAt: comment.user.createdAt,
                totalFollowers: comment.user.totalFollowers,
                totalFollowing: comment.user.totalFollowing,
            };

            return {
                id: comment.id,
                comment: comment.comment,
                reviewId: comment.reviewId,
                userId: comment.userId,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                user: safeUser,
            };
        });

        const totalComments = review.totalComments;
        const totalPages = Math.ceil(totalComments / pageSize);

        logger.info('GET /actions/review', {
            method: 'getReviewByIdWithComments',
            reviewId: id,
        });
        return {
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
            totalLikes: review.totalLikes,
            user: safeUser,
            comments: safeComments,
            totalPages,
            currentPage: page,
        };
    } catch (error) {
        logger.error('GET /actions/review', {
            method: 'getReviewByIdWithComments',
            error,
            reviewId: id,
        });
        throw new Error('Could not fetch review.');
    }
};

export const getUserLikedReview = async (
    reviewId: string,
    userId: string
): Promise<boolean> => {
    try {
        const like = await prisma.reviewLike.findUnique({
            where: { reviewId_userId: { reviewId, userId } },
        });
        logger.info('GET /actions/review', {
            method: 'getUserLikedReview',
            reviewId,
            userId,
            hasLiked: like ? true : false,
        });
        return like ? true : false;
    } catch (error) {
        logger.error('GET /actions/review', {
            method: 'getUserLikedReview',
            error,
            reviewId,
            userId,
        });
        return false;
    }
};

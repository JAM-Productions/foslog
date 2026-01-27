'use server';

import { logger } from '@/lib/axiom/server';
import { prisma } from '@/lib/prisma';
import { MediaType, User } from '@/lib/store';
import { SafeComment, SafeReviewWithMediaAndComments } from '@/lib/types';

export const getReviewById = async (
    id: string,
    page: number = 1,
    pageSize: number = 12
): Promise<SafeReviewWithMediaAndComments | null> => {
    try {
        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                media: true,
                comments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
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
                method: 'getReviewById',
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
            joinedAt: new Date(),
        };

        const safeComments: SafeComment[] = review.comments.map((comment) => {
            const safeUser: User = {
                id: comment.user.id,
                name: comment.user.name ?? 'Unknown User',
                email: '',
                image: comment.user.image ?? undefined,
                bio: undefined,
                joinedAt: new Date(),
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
            method: 'getReviewById',
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
            user: safeUser,
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
            comments: safeComments,
            totalPages,
            currentPage: page,
        };
    } catch (error) {
        logger.error('GET /actions/review', {
            method: 'getReviewById',
            error,
            reviewId: id,
        });
        throw new Error('Could not fetch review.');
    }
};

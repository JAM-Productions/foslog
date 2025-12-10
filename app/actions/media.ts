'use server';

import { prisma } from '@/lib/prisma';
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
    try {
        const skip = (page - 1) * pageSize;

        const where: Prisma.MediaItemWhereInput = {};

        if (mediaType && mediaType !== 'all') {
            where.type = mediaType.toUpperCase() as PrismaMediaType;
        }

        if (searchQuery && searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { director: { contains: query, mode: 'insensitive' } },
                { author: { contains: query, mode: 'insensitive' } },
                { artist: { contains: query, mode: 'insensitive' } },
                { genre: { has: query } },
            ];
        }

        const [mediaItems, total] = await prisma.$transaction([
            prisma.mediaItem.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: [{ averageRating: 'desc' }, { totalReviews: 'desc' }],
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

        return { items, total };
    } catch (error) {
        console.error('Error fetching media items:', error);
        throw new Error('Could not fetch media items.');
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
                user: safeUser,
            };
        });

        const totalPages = Math.ceil(mediaItem.totalReviews / pageSize);

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
        console.error(`Error fetching media item with id ${id}:`, error);
        throw new Error('Could not fetch media item.');
    }
};

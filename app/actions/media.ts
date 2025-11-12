'use server';

import { prisma } from '@/lib/prisma';
import { MediaType, User } from '@/lib/store';
import { SafeMediaItem, SafeMediaItemWithReviews } from '@/lib/types';

export const getMedias = async (): Promise<SafeMediaItem[]> => {
    try {
        const mediaItems = await prisma.mediaItem.findMany();
        // Explicitly map to SafeMediaItem to avoid extra properties from Prisma model
        return mediaItems.map((item) => ({
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
        }));
    } catch (error) {
        console.error('Error fetching media items:', error);
        throw new Error('Could not fetch media items.');
    }
};

export const getMediaById = async (
    id: string
): Promise<SafeMediaItemWithReviews | null> => {
    try {
        const mediaItem = await prisma.mediaItem.findUnique({
            where: { id },
            include: {
                reviews: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (mediaItem) {
            const { reviews, ...restOfMediaItem } = mediaItem;

            const safeReviews = reviews.map((review) => {
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
                    ...restOfReview,
                    user: safeUser,
                };
            });

            return {
                id: restOfMediaItem.id,
                title: restOfMediaItem.title,
                type: restOfMediaItem.type.toLowerCase() as MediaType,
                year: restOfMediaItem.year ?? undefined,
                director: restOfMediaItem.director ?? undefined,
                author: restOfMediaItem.author ?? undefined,
                artist: restOfMediaItem.artist ?? undefined,
                genre: restOfMediaItem.genre,
                poster: restOfMediaItem.poster ?? undefined,
                cover: restOfMediaItem.cover ?? undefined,
                description: restOfMediaItem.description,
                averageRating: restOfMediaItem.averageRating,
                totalReviews: restOfMediaItem.totalReviews,
                reviews: safeReviews,
            };
        }

        return null;
    } catch (error) {
        console.error(`Error fetching media item with id ${id}:`, error);
        throw new Error('Could not fetch media item.');
    }
};

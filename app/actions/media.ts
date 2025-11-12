'use server';

import { prisma } from '@/lib/prisma';
import { MediaType } from '@/lib/store';
import { SafeMediaItem, SafeMediaItemWithReviews } from '@/lib/types';

export const getMedias = async (): Promise<SafeMediaItem[]> => {
    try {
        const mediaItems = await prisma.mediaItem.findMany();
        return mediaItems.map((item) => ({
            ...item,
            type: item.type.toLowerCase() as MediaType,
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
            return {
                ...mediaItem,
                type: mediaItem.type.toLowerCase() as MediaType,
            };
        }

        return mediaItem;
    } catch (error) {
        console.error(`Error fetching media item with id ${id}:`, error);
        throw new Error('Could not fetch media item.');
    }
};

'use server';

import { prisma } from '@/lib/prisma';

export const getMedias = async () => {
    try {
        const mediaItems = await prisma.mediaItem.findMany();
        return mediaItems;
    } catch (error) {
        console.error('Error fetching media items:', error);
        throw new Error('Could not fetch media items.');
    }
};

export const getMediaById = async (id: string) => {
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
        return mediaItem;
    } catch (error) {
        console.error(`Error fetching media item with id ${id}:`, error);
        throw new Error('Could not fetch media item.');
    }
};

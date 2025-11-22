'use server';

import { prisma } from '@/lib/prisma';
import { User } from '@/lib/store';
import { SafeReviewWithMedia } from '@/lib/types';

export const getReviewById = async (
    id: string
): Promise<SafeReviewWithMedia | null> => {
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
                media: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                    },
                },
            },
        });

        if (!review) {
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

        return {
            id: review.id,
            mediaId: review.mediaId,
            userId: review.userId,
            rating: review.rating,
            review: review.review ?? undefined,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            user: safeUser,
            media: {
                id: review.media.id,
                title: review.media.title,
                type: review.media.type.toLowerCase(),
            },
        };
    } catch (error) {
        console.error(`Error fetching review with id ${id}:`, error);
        throw new Error('Could not fetch review.');
    }
};

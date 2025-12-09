'use server';

import { prisma } from '@/lib/prisma';
import { MediaType, User } from '@/lib/store';
import { SafeReviewWithMedia } from '@/lib/types';
import { revalidatePath } from 'next/cache';

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
                media: true,
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
            },
        };
    } catch (error) {
        console.error(`Error fetching review with id ${id}:`, error);
        throw new Error('Could not fetch review.');
    }
};

export const updateReview = async (
    id: string,
    review: { stars: number; text: string }
) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/review/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ review }),
            }
        );
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`Error updating review with id ${id}:`, error);
        throw new Error('Could not update review.');
    }
};

export const deleteReview = async (id: string) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/review/${id}`,
            {
                method: 'DELETE',
            }
        );
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`Error deleting review with id ${id}:`, error);
        throw new Error('Could not delete review.');
    }
};

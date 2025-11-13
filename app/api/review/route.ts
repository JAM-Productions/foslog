import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import {
    internalServerError,
    notFound,
    unauthorized,
    validationError,
} from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to create a review.'
            );
        }

        const { review, mediaId } = await request.json();

        if (!review) {
            return validationError('Review object is required');
        }

        if (!review.stars || review.stars < 1 || review.stars > 5) {
            return validationError('Rating must be between 1 and 5');
        }

        if (!review.text || review.text.trim().length === 0) {
            return validationError('Review text is required');
        }

        if (review.text.length > 5000) {
            return validationError('Review text is too long');
        }

        if (!mediaId) {
            return validationError('Media ID is required');
        }

        const result = await prisma.$transaction(async (tx) => {
            const mediaItem = await tx.mediaItem.findUnique({
                where: { id: mediaId },
            });

            if (!mediaItem) {
                throw new Error('MEDIA_NOT_FOUND');
            }

            const reviewItem = await tx.review.create({
                data: {
                    rating: review.stars,
                    review: review.text,
                    mediaId: mediaId,
                    userId: session.user.id,
                },
            });

            const newAverageRating =
                (mediaItem.averageRating * mediaItem.totalReviews +
                    review.stars) /
                (mediaItem.totalReviews + 1);

            const roundedAverage = Number(newAverageRating.toFixed(1));

            await tx.mediaItem.update({
                where: { id: mediaId },
                data: {
                    averageRating: roundedAverage,
                    totalReviews: { increment: 1 },
                },
            });

            return reviewItem;
        });

        return NextResponse.json(
            {
                message: 'Review created successfully',
                media: result,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in POST /api/review:', error);

        if (error instanceof Error && error.message === 'MEDIA_NOT_FOUND') {
            return notFound('Media item not found');
        }

        return internalServerError();
    }
}

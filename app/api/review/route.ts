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
            return unauthorized('Unauthorized. Please log in to create a review.');
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

        const mediaItem = await prisma.mediaItem.findUnique({
            where: { id: mediaId },
        });

        if (!mediaItem) {
            return notFound('Media item not found');
        }

        const reviewItem = await prisma.review.create({
            data: {
                rating: review.stars,
                review: review.text,
                mediaId: mediaId,
                userId: session.user.id,
            },
        });

        return NextResponse.json(
            {
                message: 'Review created successfully',
                media: reviewItem,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in POST /api/review:', error);
        return internalServerError();
    }
}

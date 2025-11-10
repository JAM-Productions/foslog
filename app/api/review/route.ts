import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { ApiError } from '@/lib/errors';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            throw new ApiError(401, 'Unauthorized. Please log in to create a review.');
        }

        const { review, mediaId } = await request.json();

        if (!review) {
            throw new ApiError(400, 'Review object is required');
        }

        if (!review.stars || review.stars < 1 || review.stars > 5) {
            throw new ApiError(400, 'Rating must be between 1 and 5');
        }

        if (!review.text || review.text.trim().length === 0) {
            throw new ApiError(400, 'Review text is required');
        }

        if (review.text.length > 5000) {
            throw new ApiError(400, 'Review text is too long');
        }

        if (!mediaId) {
            throw new ApiError(400, 'Media ID is required');
        }

        const mediaItem = await prisma.mediaItem.findUnique({
            where: { id: mediaId },
        });

        if (!mediaItem) {
            throw new ApiError(404, 'Media item not found');
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
        if (error instanceof ApiError) {
            return NextResponse.json(
                { error: error.message },
                { status: error.statusCode }
            );
        }

        console.error('Error in POST /api/review:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

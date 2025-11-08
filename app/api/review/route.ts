import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in to create a review.' },
                { status: 401 }
            );
        }

        const { review, mediaId } = await request.json();

        if (!review) {
            return NextResponse.json(
                { error: 'Review object is required' },
                { status: 400 }
            );
        }

        if (!mediaId) {
            return NextResponse.json(
                { error: 'Media ID is required' },
                { status: 400 }
            );
        }

        const mediaItem = await prisma.mediaItem.findUnique({
            where: { id: mediaId },
        });

        if (!mediaItem) {
            return NextResponse.json(
                { error: 'Media item not found' },
                { status: 404 }
            );
        }

        const existingReview = await prisma.review.findUnique({
            where: {
                mediaId_userId: {
                    mediaId: mediaId,
                    userId: session.user.id,
                },
            },
        });

        if (existingReview) {
            return NextResponse.json(
                { error: 'You have already reviewed this media item' },
                { status: 409 }
            );
        }

        const reviewItem = await prisma.review.create({
            data: {
                rating: review.stars,
                review: review.text,
                mediaId: mediaId,
                userId: session.user.id,
            },
        });

        console.log('Created new review item:', reviewItem);

        return NextResponse.json(
            {
                message: 'Review created successfully',
                media: reviewItem,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in POST /api/review:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

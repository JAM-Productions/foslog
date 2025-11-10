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

        if (!review.stars || review.stars < 1 || review.stars > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        if (!review.text || review.text.trim().length === 0) {
            return NextResponse.json(
                { error: 'Review text is required' },
                { status: 400 }
            );
        }

        if (review.text.length > 5000) {
            return NextResponse.json(
                { error: 'Review text is too long' },
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

        const reviews = await prisma.review.findMany({
            where: { mediaId: mediaId },
        });

        const totalReviews = reviews.length + 1;
        const totalRating =
            reviews.reduce((acc, r) => acc + r.rating, 0) + review.stars;
        const averageRating = totalRating / totalReviews;

        const [reviewItem] = await prisma.$transaction([
            prisma.review.create({
                data: {
                    rating: review.stars,
                    review: review.text,
                    mediaId: mediaId,
                    userId: session.user.id,
                },
            }),
            prisma.mediaItem.update({
                where: { id: mediaId },
                data: {
                    totalReviews: totalReviews,
                    averageRating: averageRating,
                },
            }),
        ]);

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

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { LOCALES } from '@/lib/constants';
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

        if (review.text && review.text.length > 5000) {
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

            const { _avg, _count } = await tx.review.aggregate({
                where: { mediaId },
                _avg: { rating: true },
                _count: true,
            });

            await tx.mediaItem.update({
                where: { id: mediaId },
                data: {
                    averageRating: Number(_avg.rating?.toFixed(1)) || 0,
                    totalReviews: _count,
                },
            });

            return reviewItem;
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';

        revalidatePath(`/${locale}/media/${mediaId}`, 'page');

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

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { LOCALES } from '@/lib/constants';
import { logger } from '@/lib/axiom/server';
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

        // Validate that at least one of stars or liked is provided
        const hasRating = review.stars !== undefined && review.stars !== null;
        const hasLike = review.liked !== undefined && review.liked !== null;

        if (!hasRating && !hasLike) {
            return validationError(
                'Either rating (stars) or like/dislike must be provided'
            );
        }

        if (hasRating && (review.stars < 1 || review.stars > 5)) {
            return validationError('Rating must be between 1 and 5');
        }

        if (review.text && review.text.length > 5000) {
            return validationError('Review text is too long');
        }

        if (
            review.consumedMoreThanOnce !== undefined &&
            typeof review.consumedMoreThanOnce !== 'boolean'
        ) {
            return validationError('consumedMoreThanOnce must be a boolean');
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

        const result = await prisma.review.create({
            data: {
                rating: review.stars || null,
                liked: review.liked !== undefined ? review.liked : null,
                review: review.text,
                consumedMoreThanOnce: review.consumedMoreThanOnce || false,
                mediaId: mediaId,
                userId: session.user.id,
            },
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';

        revalidatePath(`/${locale}/media/${mediaId}`, 'page');
        logger.info('POST /api/review', {
            userId: session.user.id,
            mediaId,
            reviewId: result.id,
        });
        return NextResponse.json(
            {
                message: 'Review created successfully',
                media: result,
            },
            { status: 201 }
        );
    } catch (error) {
        logger.error('POST /api/review', { error });
        return internalServerError();
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to delete a review.'
            );
        }

        const { reviewId } = await request.json();

        if (!reviewId) {
            return validationError('Review ID is required');
        }

        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!existingReview) {
            return notFound('Review not found');
        }

        if (existingReview.userId !== session.user.id) {
            return unauthorized(
                'You are not authorized to delete this review.'
            );
        }

        await prisma.review.delete({
            where: { id: reviewId },
        });

        const mediaId = existingReview.mediaId;

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';

        revalidatePath(`/${locale}/media/${mediaId}`, 'page');
        revalidatePath(`/${locale}/review/${reviewId}`, 'page');
        logger.info('DELETE /api/review', {
            userId: session.user.id,
            mediaId,
            reviewId: reviewId,
        });
        return NextResponse.json(
            {
                message: 'Review deleted successfully',
                mediaId: mediaId,
            },
            { status: 200 }
        );
    } catch (error) {
        logger.error('DELETE /api/review', { error });
        return internalServerError();
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to update a review.'
            );
        }
        const { review, reviewId } = await request.json();

        if (!reviewId) {
            return validationError('Review ID is required');
        }
        if (!review) {
            return validationError('Review object is required');
        }
        const hasRating = review.stars !== undefined && review.stars !== null;
        const hasLike = review.liked !== undefined && review.liked !== null;
        if (!hasRating && !hasLike) {
            return validationError(
                'Either rating (stars) or like/dislike must be provided'
            );
        }
        if (hasRating && (review.stars < 1 || review.stars > 5)) {
            return validationError('Rating must be between 1 and 5');
        }
        if (review.text && review.text.length > 5000) {
            return validationError('Review text is too long');
        }
        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!existingReview) {
            return notFound('Review not found');
        }
        if (existingReview.userId !== session.user.id) {
            return unauthorized(
                'You are not authorized to update this review.'
            );
        }
        await prisma.review.update({
            where: { id: reviewId },
            data: {
                rating: review.stars ?? null,
                liked: review.liked ?? null,
                review: review.text,
            },
        });
        const mediaId = existingReview.mediaId;

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/review/${reviewId}`, 'page');
        logger.info('PATCH /api/review', {
            userId: session.user.id,
            mediaId,
            reviewId,
        });
        return NextResponse.json(
            {
                message: 'Review updated successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        logger.error('PATCH /api/review', { error });
        return internalServerError();
    }
}

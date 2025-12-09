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

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to update a review.'
            );
        }

        const { review } = await request.json();

        if (!review) {
            return validationError('Review object is required');
        }

        if (!review.stars || review.stars < 1 || review.stars > 5) {
            return validationError('Rating must be between 1 and 5');
        }

        if (review.text && review.text.length > 5000) {
            return validationError('Review text is too long');
        }

        const reviewItem = await prisma.review.findUnique({
            where: { id: params.id },
        });

        if (!reviewItem) {
            return notFound('Review not found');
        }

        if (reviewItem.userId !== session.user.id) {
            return unauthorized('You are not authorized to update this review');
        }

        const result = await prisma.$transaction(async (tx) => {
            const updatedReview = await tx.review.update({
                where: { id: params.id },
                data: {
                    rating: review.stars,
                    review: review.text,
                },
            });

            const { _avg, _count } = await tx.review.aggregate({
                where: { mediaId: updatedReview.mediaId },
                _avg: { rating: true },
                _count: true,
            });

            await tx.mediaItem.update({
                where: { id: updatedReview.mediaId },
                data: {
                    averageRating: Number(_avg.rating?.toFixed(1)) || 0,
                    totalReviews: _count,
                },
            });

            return updatedReview;
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';

        revalidatePath(`/${locale}/media/${result.mediaId}`, 'page');
        revalidatePath(`/${locale}/review/${result.id}`, 'page');

        return NextResponse.json(
            {
                message: 'Review updated successfully',
                review: result,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in PUT /api/review/[id]:', error);
        return internalServerError();
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to delete a review.'
            );
        }

        const reviewItem = await prisma.review.findUnique({
            where: { id: params.id },
        });

        if (!reviewItem) {
            return notFound('Review not found');
        }

        if (reviewItem.userId !== session.user.id) {
            return unauthorized('You are not authorized to delete this review');
        }

        const result = await prisma.$transaction(async (tx) => {
            await tx.review.delete({
                where: { id: params.id },
            });

            const { _avg, _count } = await tx.review.aggregate({
                where: { mediaId: reviewItem.mediaId },
                _avg: { rating: true },
                _count: true,
            });

            await tx.mediaItem.update({
                where: { id: reviewItem.mediaId },
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

        revalidatePath(`/${locale}/media/${result.mediaId}`, 'page');

        return NextResponse.json(
            {
                message: 'Review deleted successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in DELETE /api/review/[id]:', error);
        return internalServerError();
    }
}

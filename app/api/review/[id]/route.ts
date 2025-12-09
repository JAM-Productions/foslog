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
    forbidden,
} from '@/lib/errors';

export async function PATCH(
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

        const { id } = params;
        const { review } = await request.json();

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
            where: { id },
        });

        if (!existingReview) {
            return notFound('Review not found');
        }

        if (existingReview.userId !== session.user.id) {
            return forbidden('You are not authorized to update this review');
        }

        const result = await prisma.$transaction(async (tx) => {
            const updatedReview = await tx.review.update({
                where: { id },
                data: {
                    rating: review.stars || null,
                    liked: review.liked !== undefined ? review.liked : null,
                    review: review.text,
                },
            });

            const mediaId = updatedReview.mediaId;

            const { _avg } = await tx.review.aggregate({
                where: {
                    mediaId,
                    rating: { not: null },
                },
                _avg: { rating: true },
            });

            const [likesCount, dislikesCount, totalReviewsCount] =
                await Promise.all([
                    tx.review.count({
                        where: {
                            mediaId,
                            liked: true,
                        },
                    }),
                    tx.review.count({
                        where: {
                            mediaId,
                            liked: false,
                        },
                    }),
                    tx.review.count({
                        where: { mediaId },
                    }),
                ]);

            await tx.mediaItem.update({
                where: { id: mediaId },
                data: {
                    averageRating: Number(_avg.rating?.toFixed(1)) || 0,
                    totalReviews: totalReviewsCount,
                    totalLikes: likesCount,
                    totalDislikes: dislikesCount,
                },
            });

            return updatedReview;
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';

        revalidatePath(`/${locale}/media/${result.mediaId}`, 'page');
        revalidatePath(`/${locale}/review/${id}`, 'page');

        return NextResponse.json(
            {
                message: 'Review updated successfully',
                review: result,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in PATCH /api/review/[id]:', error);
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

        const { id } = params;

        const existingReview = await prisma.review.findUnique({
            where: { id },
        });

        if (!existingReview) {
            return notFound('Review not found');
        }

        if (existingReview.userId !== session.user.id) {
            return forbidden('You are not authorized to delete this review');
        }

        const result = await prisma.$transaction(async (tx) => {
            const deletedReview = await tx.review.delete({
                where: { id },
            });

            const mediaId = deletedReview.mediaId;

            const { _avg } = await tx.review.aggregate({
                where: {
                    mediaId,
                    rating: { not: null },
                },
                _avg: { rating: true },
            });

            const [likesCount, dislikesCount, totalReviewsCount] =
                await Promise.all([
                    tx.review.count({
                        where: {
                            mediaId,
                            liked: true,
                        },
                    }),
                    tx.review.count({
                        where: {
                            mediaId,
                            liked: false,
                        },
                    }),
                    tx.review.count({
                        where: { mediaId },
                    }),
                ]);

            await tx.mediaItem.update({
                where: { id: mediaId },
                data: {
                    averageRating: Number(_avg.rating?.toFixed(1)) || 0,
                    totalReviews: totalReviewsCount,
                    totalLikes: likesCount,
                    totalDislikes: dislikesCount,
                },
            });

            return deletedReview;
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

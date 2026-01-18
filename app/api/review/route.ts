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
                    rating: review.stars || null,
                    liked: review.liked !== undefined ? review.liked : null,
                    review: review.text,
                    mediaId: mediaId,
                    userId: session.user.id,
                },
            });

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

        const result = await prisma.$transaction(async (tx) => {
            const existingReview = await tx.review.findUnique({
                where: { id: reviewId },
            });

            if (!existingReview) {
                throw new Error('REVIEW_NOT_FOUND');
            }

            if (existingReview.userId !== session.user.id) {
                throw new Error('UNAUTHORIZED_DELETE');
            }

            await tx.review.delete({
                where: { id: reviewId },
            });
            const mediaId = existingReview.mediaId;

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

            return mediaId;
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';

        revalidatePath(`/${locale}/media/${result}`, 'page');

        return NextResponse.json(
            {
                message: 'Review deleted successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in DELETE /api/review:', error);

        if (error instanceof Error) {
            if (error.message === 'REVIEW_NOT_FOUND') {
                return notFound('Review not found');
            }
            if (error.message === 'UNAUTHORIZED_DELETE') {
                return unauthorized(
                    'You are not authorized to delete this review.'
                );
            }
        }

        return internalServerError();
    }
}

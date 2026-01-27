import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import { LOCALES } from '@/lib/constants';
import {
    internalServerError,
    notFound,
    unauthorized,
    validationError,
} from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to create a comment.'
            );
        }

        const { reviewId, comment } = await request.json();

        if (!reviewId) {
            return validationError('Review id is required');
        }

        if (!comment || comment.trim().length === 0) {
            return validationError('Comment text is required');
        }

        if (comment.length > 2000) {
            return validationError('Comment text is too long');
        }
        const result = await prisma.$transaction(async (tx) => {
            const reviewItem = await tx.review.findUnique({
                where: { id: reviewId },
            });

            if (!reviewItem) {
                throw new Error('REVIEW_NOT_FOUND');
            }

            const commentItem = await tx.comment.create({
                data: {
                    comment,
                    reviewId: reviewId,
                    userId: session.user.id,
                },
            });

            await tx.review.update({
                where: { id: reviewId },
                data: {
                    totalComments: { increment: 1 },
                },
            });

            return commentItem;
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';

        revalidatePath(`/${locale}/review/${reviewId}`, 'page');
        logger.info('POST /api/comment', {
            userId: session.user.id,
            commentId: result.id,
            reviewId: reviewId,
        });
        return NextResponse.json(
            {
                message: 'Comment created successfully',
                comment: result,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Error && error.message === 'REVIEW_NOT_FOUND') {
            return notFound('Review not found');
        }
        logger.error('POST /api/comment', { error });
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
                'Unauthorized. Please log in to delete a comment.'
            );
        }
        const { commentId, reviewId } = await request.json();

        if (!commentId) {
            return validationError('Comment id is required');
        }
        if (!reviewId) {
            return validationError('Review id is required');
        }
        const result = await prisma.$transaction(async (tx) => {
            const commentItem = await tx.comment.findUnique({
                where: { id: commentId },
            });
            if (!commentItem) {
                throw new Error('COMMENT_NOT_FOUND');
            }
            if (commentItem.userId !== session.user.id) {
                throw new Error('UNAUTHORIZED');
            }
            await tx.comment.delete({
                where: { id: commentId },
            });
            await tx.review.update({
                where: { id: reviewId },
                data: {
                    totalComments: { decrement: 1 },
                },
            });
            return commentItem;
        });
        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/review/${reviewId}`, 'page');
        logger.info('DELETE /api/comment', {
            userId: session.user.id,
            commentId: result.id,
            reviewId: reviewId,
        });
        return NextResponse.json({
            message: 'Comment deleted successfully',
            comment: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'COMMENT_NOT_FOUND') {
                return notFound('Comment not found');
            }
            if (error.message === 'UNAUTHORIZED') {
                return unauthorized(
                    'You are not authorized to delete this comment.'
                );
            }
        }
        logger.error('DELETE /api/comment', { error });
        return internalServerError();
    }
}

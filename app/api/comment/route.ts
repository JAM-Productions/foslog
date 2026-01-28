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
        const reviewItem = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!reviewItem) {
            return notFound('Review not found');
        }

        const result = await prisma.comment.create({
            data: {
                comment,
                reviewId: reviewId,
                userId: session.user.id,
            },
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
        const { commentId } = await request.json();

        if (!commentId) {
            return validationError('Comment id is required');
        }

        const commentItem = await prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!commentItem) {
            return notFound('Comment not found');
        }
        if (commentItem.userId !== session.user.id) {
            return unauthorized(
                'You are not authorized to delete this comment.'
            );
        }
        await prisma.comment.delete({
            where: { id: commentId },
        });
        
        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/review/${commentItem.reviewId}`, 'page');
        logger.info('DELETE /api/comment', {
            userId: session.user.id,
            commentId: commentItem.id,
            reviewId: commentItem.reviewId,
        });
        return NextResponse.json({
            message: 'Comment deleted successfully',
            comment: commentItem,
        });
    } catch (error) {
        logger.error('DELETE /api/comment', { error });
        return internalServerError();
    }
}

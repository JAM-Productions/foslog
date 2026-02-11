import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import { Prisma } from '@prisma/client';
import {
    conflict,
    internalServerError,
    notFound,
    unauthorized,
} from '@/lib/errors';
import { revalidatePath } from 'next/cache';
import { LOCALES } from '@/lib/constants';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to like a review.'
            );
        }

        const { id: reviewId } = await params;

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            return notFound('Review not found');
        }

        const result = await prisma.$transaction(async (tx) => {
            const existingLike = await tx.reviewLike.findUnique({
                where: {
                    reviewId_userId: {
                        reviewId,
                        userId: session.user.id,
                    },
                },
            });

            if (existingLike) {
                throw new Error('ALREADY_LIKED');
            }

            return await tx.reviewLike.create({
                data: {
                    reviewId,
                    userId: session.user.id,
                },
            });
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';

        revalidatePath(`/${locale}/review/${reviewId}`, 'page');
        revalidatePath(`/${locale}/media/${review.mediaId}`, 'page');
        logger.info('POST /api/review/[id]/like', {
            reviewId,
            userId: session.user.id,
            likeId: result.id,
        });
        return NextResponse.json(
            { message: 'Review liked successfully' },
            { status: 201 }
        );
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            logger.warn('POST /api/review/[id]/like', {
                type: 'UniqueConstraintViolation',
                error,
            });
            return conflict('You already liked this review');
        }

        if (error instanceof Error && error.message === 'ALREADY_LIKED') {
            logger.warn('POST /api/review/[id]/like', {
                type: 'UniqueConstraintViolation',
                error,
            });
            return conflict('You already liked this review');
        }

        logger.error('POST /api/review/[id]/like', { error });
        return internalServerError();
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to unlike a review.'
            );
        }

        const { id: reviewId } = await params;

        const existingLike = await prisma.$transaction(async (tx) => {
            const like = await tx.reviewLike.findUnique({
                where: {
                    reviewId_userId: {
                        reviewId,
                        userId: session.user.id,
                    },
                },
            });

            if (!like) {
                throw new Error('LIKE_NOT_FOUND');
            }

            await tx.reviewLike.delete({
                where: {
                    reviewId_userId: {
                        reviewId,
                        userId: session.user.id,
                    },
                },
            });

            return like;
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/review/${reviewId}`, 'page');
        revalidatePath(`/${locale}/media/${existingLike.reviewId}`, 'page');
        logger.info('DELETE /api/review/[id]/like', {
            reviewId,
            userId: session.user.id,
        });

        return NextResponse.json(
            { message: 'Review unliked successfully' },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error && error.message === 'LIKE_NOT_FOUND') {
            return notFound('Like not found');
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            logger.warn('DELETE /api/review/[id]/like', {
                type: 'RecordNotFound',
                error,
            });
            return notFound('Like not found');
        }

        logger.error('DELETE /api/review/[id]/like', { error });
        return internalServerError();
    }
}

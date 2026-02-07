import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
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

        const existingLike = await prisma.reviewLike.findUnique({
            where: {
                reviewId_userId: {
                    reviewId,
                    userId: session.user.id,
                },
            },
        });

        if (existingLike) {
            return conflict('You already liked this review');
        }

        const result = await prisma.reviewLike.create({
            data: {
                reviewId,
                userId: session.user.id,
            },
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';

        revalidatePath(`/${locale}/review/${reviewId}`, 'page');
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

        const existingLike = await prisma.reviewLike.findUnique({
            where: {
                reviewId_userId: {
                    reviewId,
                    userId: session.user.id,
                },
            },
        });

        if (!existingLike) {
            return notFound('Like not found');
        }

        await prisma.reviewLike.delete({
            where: {
                reviewId_userId: {
                    reviewId,
                    userId: session.user.id,
                },
            },
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/review/${reviewId}`, 'page');
        logger.info('DELETE /api/review/[id]/like', {
            reviewId,
            userId: session.user.id,
        });

        return NextResponse.json(
            { message: 'Review unliked successfully' },
            { status: 200 }
        );
    } catch (error) {
        logger.error('DELETE /api/review/[id]/like', { error });
        return internalServerError();
    }
}

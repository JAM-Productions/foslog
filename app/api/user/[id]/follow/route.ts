import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import { LOCALES } from '@/lib/constants';
import { conflict, internalServerError, unauthorized } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return unauthorized(
                'Unauthorized. Please log in to follow an account.'
            );
        }

        const currentUserId = session.user.id;
        const { id: targetUserId } = await params;

        if (currentUserId === targetUserId) {
            return conflict('You cannot follow yourself.');
        }

        await prisma.follow.create({
            data: {
                followerId: currentUserId,
                followingId: targetUserId,
            },
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/profile/${targetUserId}`, 'page');
        logger.info('POST /api/user/[id]/follow', {
            followerId: currentUserId,
            followingId: targetUserId,
        });

        return NextResponse.json(
            { message: 'User followed successfully' },
            { status: 201 }
        );
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return conflict('You are already following this user.');
        }

        logger.error('POST /api/user/[id]/follow', { error });
        return internalServerError('Failed to follow user');
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

        if (!session?.user) {
            return unauthorized(
                'Unauthorized. Please log in to unfollow an account.'
            );
        }
        const currentUserId = session.user.id;
        const { id: targetUserId } = await params;

        if (currentUserId === targetUserId) {
            return conflict('You cannot unfollow yourself.');
        }

        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId,
                },
            },
        });
        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/profile/${targetUserId}`, 'page');
        logger.info('DELETE /api/user/[id]/follow', {
            followerId: currentUserId,
            followingId: targetUserId,
        });
        return NextResponse.json(
            { message: 'User unfollowed successfully' },
            { status: 200 }
        );
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return conflict('You are not following this user.');
        }
        logger.error('DELETE /api/user/[id]/follow', { error });
        return internalServerError('Failed to unfollow user');
    }
}

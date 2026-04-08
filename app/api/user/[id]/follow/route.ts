import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import { LOCALES } from '@/lib/constants';
import {
    conflict,
    internalServerError,
    notFound,
    unauthorized,
} from '@/lib/errors';
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

        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true },
        });

        if (!targetUser) {
            return notFound('User not found.');
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

        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { id: true },
        });

        if (!targetUser) {
            return notFound('User not found.');
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return unauthorized(
                'Unauthorized. Please log in to view followers and following.'
            );
        }

        const currentUserId = session.user.id;
        const { id: targetUserId } = await params;

        if (!targetUserId) {
            return notFound('User ID is required.');
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as 'followers' | 'following' | null;
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '50');
        const skip = (page - 1) * pageSize;

        const userSelect = {
            id: true,
            name: true,
            image: true,
            followers: {
                where: {
                    followerId: currentUserId,
                },
                select: {
                    followerId: true,
                },
            },
        };

        const fetchFollowers =
            !type || type === 'followers'
                ? prisma.follow.findMany({
                      where: { followingId: targetUserId },
                      select: {
                          follower: {
                              select: userSelect,
                          },
                      },
                      orderBy: { createdAt: 'desc' },
                      skip,
                      take: pageSize + 1,
                  })
                : Promise.resolve([]);

        const fetchFollowing =
            !type || type === 'following'
                ? prisma.follow.findMany({
                      where: { followerId: targetUserId },
                      select: {
                          following: {
                              select: userSelect,
                          },
                      },
                      orderBy: { createdAt: 'desc' },
                      skip,
                      take: pageSize + 1,
                  })
                : Promise.resolve([]);

        const [rawFollowers, rawFollowing] = await Promise.all([
            fetchFollowers,
            fetchFollowing,
        ]);

        const hasMoreFollowers = rawFollowers.length > pageSize;
        const hasMoreFollowing = rawFollowing.length > pageSize;

        const followers = rawFollowers.slice(0, pageSize).map((f) => ({
            id: f.follower.id,
            name: f.follower.name,
            image: f.follower.image,
            isFollowing: f.follower.followers.length > 0,
        }));

        const following = rawFollowing.slice(0, pageSize).map((f) => ({
            id: f.following.id,
            name: f.following.name,
            image: f.following.image,
            isFollowing: f.following.followers.length > 0,
        }));

        logger.info('GET /api/user/[id]/follow', {
            targetUserId,
            type,
            page,
            pageSize,
            followersCount: followers.length,
            followingCount: following.length,
        });

        return NextResponse.json(
            {
                followers,
                following,
                hasMoreFollowers,
                hasMoreFollowing,
            },
            { status: 200 }
        );
    } catch (error) {
        logger.error('GET /api/user/[id]/follow', { error });
        return internalServerError('Failed to fetch followers and following');
    }
}

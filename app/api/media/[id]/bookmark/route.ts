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
import { ListType, Prisma } from '@prisma/client';
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

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to bookmark media.'
            );
        }

        const currentUserId = session.user.id;
        const { id: mediaId } = await params;

        const media = await prisma.mediaItem.findUnique({
            where: { id: mediaId },
            select: { id: true, title: true },
        });

        if (!media) {
            return notFound('Media not found.');
        }

        let bookmarkList = await prisma.list.findFirst({
            where: {
                userId: currentUserId,
                type: ListType.BOOKMARK,
            },
        });

        if (!bookmarkList) {
            bookmarkList = await prisma.list.create({
                data: {
                    name: 'Bookmarks',
                    userId: currentUserId,
                    type: ListType.BOOKMARK,
                },
            });
        }

        const existingBookmark = await prisma.listMediaItem.findUnique({
            where: {
                listId_mediaId: {
                    listId: bookmarkList.id,
                    mediaId,
                },
            },
        });

        if (existingBookmark) {
            return conflict('Media is already bookmarked.');
        }

        await prisma.listMediaItem.create({
            data: {
                listId: bookmarkList.id,
                mediaId,
            },
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/media/${mediaId}`, 'page');
        revalidatePath(
            `/${locale}/profile/${currentUserId}/list/${bookmarkList.id}`,
            'page'
        );

        logger.info('POST /api/media/[id]/bookmark', {
            userId: currentUserId,
            mediaId,
            mediaTitle: media.title,
        });

        return NextResponse.json(
            { message: 'Media bookmarked successfully' },
            { status: 201 }
        );
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return conflict('Media is already bookmarked.');
        }

        logger.error('POST /api/media/[id]/bookmark', { error });
        return internalServerError('Failed to bookmark media');
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
                'Unauthorized. Please log in to remove bookmarks.'
            );
        }

        const currentUserId = session.user.id;
        const { id: mediaId } = await params;

        const bookmarkList = await prisma.list.findFirst({
            where: {
                userId: currentUserId,
                type: ListType.BOOKMARK,
            },
        });

        if (!bookmarkList) {
            return notFound('Bookmark list not found.');
        }

        const existingBookmark = await prisma.listMediaItem.findUnique({
            where: {
                listId_mediaId: {
                    listId: bookmarkList.id,
                    mediaId,
                },
            },
        });

        if (!existingBookmark) {
            return notFound('Bookmark not found.');
        }

        await prisma.listMediaItem.delete({
            where: {
                listId_mediaId: {
                    listId: bookmarkList.id,
                    mediaId,
                },
            },
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/media/${mediaId}`, 'page');
        revalidatePath(
            `/${locale}/profile/${currentUserId}/list/${bookmarkList.id}`,
            'page'
        );

        logger.info('DELETE /api/media/[id]/bookmark', {
            userId: currentUserId,
            mediaId,
        });

        return NextResponse.json(
            { message: 'Bookmark removed successfully' },
            { status: 200 }
        );
    } catch (error) {
        logger.error('DELETE /api/media/[id]/bookmark', { error });
        return internalServerError('Failed to remove bookmark');
    }
}

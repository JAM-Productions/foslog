import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import {
    LOCALES,
    MAX_LIST_DESCRIPTION_LENGTH,
    MAX_LIST_IMAGE_LENGTH,
    MAX_LIST_NAME_LENGTH,
    MAX_LISTS_PER_USER,
    MIN_LIST_NAME_LENGTH,
} from '@/lib/constants';
import {
    conflict,
    internalServerError,
    invalidInput,
    notFound,
    unauthorized,
} from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { ListType } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * The current user's lists, each flagged with whether it already holds the
 * given media. Backs the "add to list" modal on the media page.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to see your lists.'
            );
        }

        const currentUserId = session.user.id;
        const mediaId = request.nextUrl.searchParams.get('mediaId');

        if (!mediaId) {
            return invalidInput('mediaId is required');
        }

        const lists = await prisma.list.findMany({
            where: { userId: currentUserId },
            select: {
                id: true,
                name: true,
                image: true,
                type: true,
                _count: { select: { mediaItems: true } },
                // Filtered relation: empty unless this list holds the media.
                mediaItems: {
                    where: { mediaId },
                    select: { id: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const toSummary = (list: (typeof lists)[number]) => ({
            id: list.id,
            name: list.name,
            image: list.image ?? undefined,
            type: list.type,
            totalItems: list._count.mediaItems,
            containsMedia: list.mediaItems.length > 0,
        });

        const bookmarkList = lists.find(
            (list) => list.type === ListType.BOOKMARK
        );

        logger.info('GET /api/list', {
            userId: currentUserId,
            mediaId,
            listCount: lists.length,
        });

        return NextResponse.json(
            {
                // Null until the user bookmarks something for the first time.
                bookmark: bookmarkList ? toSummary(bookmarkList) : null,
                lists: lists
                    .filter((list) => list.type === ListType.LIST)
                    .map(toSummary),
            },
            { status: 200 }
        );
    } catch (error) {
        logger.error('GET /api/list', { error });
        return internalServerError('Failed to fetch lists');
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to create a list.'
            );
        }

        const currentUserId = session.user.id;

        const { name, description, image } = (await request.json()) as {
            name?: string;
            description?: string | null;
            image?: string | null;
        };

        if (typeof name !== 'string') {
            return invalidInput('name is required');
        }

        const trimmedName = name.trim();

        if (
            trimmedName.length < MIN_LIST_NAME_LENGTH ||
            trimmedName.length > MAX_LIST_NAME_LENGTH
        ) {
            return invalidInput(
                `Name must be between ${MIN_LIST_NAME_LENGTH} and ${MAX_LIST_NAME_LENGTH} characters long`
            );
        }

        if (
            description !== undefined &&
            description !== null &&
            typeof description !== 'string'
        ) {
            return invalidInput('Invalid description format');
        }

        const trimmedDescription = description?.trim() || null;

        if (
            trimmedDescription &&
            trimmedDescription.length > MAX_LIST_DESCRIPTION_LENGTH
        ) {
            return invalidInput(
                `Description must be at most ${MAX_LIST_DESCRIPTION_LENGTH} characters long`
            );
        }

        if (image !== undefined && image !== null) {
            if (typeof image !== 'string' || !image.startsWith('data:image/')) {
                return invalidInput('Invalid image format');
            }

            if (image.length > MAX_LIST_IMAGE_LENGTH) {
                return invalidInput('Image is too large');
            }
        }

        const listCount = await prisma.list.count({
            where: { userId: currentUserId, type: ListType.LIST },
        });

        if (listCount >= MAX_LISTS_PER_USER) {
            return conflict(
                `You cannot have more than ${MAX_LISTS_PER_USER} lists.`
            );
        }

        const list = await prisma.list.create({
            data: {
                name: trimmedName,
                description: trimmedDescription,
                image: image ?? null,
                userId: currentUserId,
                // Bookmark lists are managed by the app, never created by users.
                type: ListType.LIST,
            },
            select: {
                id: true,
                name: true,
                description: true,
                type: true,
            },
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/profile/${currentUserId}`, 'page');
        revalidatePath(`/${locale}/profile/${currentUserId}/lists`, 'page');

        logger.info('POST /api/list', {
            userId: currentUserId,
            listId: list.id,
        });

        return NextResponse.json(
            { message: 'List created successfully', list },
            { status: 201 }
        );
    } catch (error) {
        logger.error('POST /api/list', { error });
        return internalServerError('Failed to create list');
    }
}

/**
 * Adds a media item to one of the user's lists. Idempotent: re-adding an item
 * already in the list succeeds instead of erroring, so double clicks are safe.
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to add an item to a list.'
            );
        }

        const currentUserId = session.user.id;

        const { mediaId, listId } = (await request.json()) as {
            mediaId: string;
            listId: string;
        };

        if (!mediaId || !listId) {
            return invalidInput('mediaId and listId are required');
        }

        const list = await prisma.list.findUnique({
            where: { id: listId },
            select: { userId: true },
        });

        if (!list) {
            return notFound('List not found.');
        }

        if (list.userId !== currentUserId) {
            return unauthorized('Cannot modify a list you do not own.');
        }

        const media = await prisma.mediaItem.findUnique({
            where: { id: mediaId },
            select: { id: true },
        });

        if (!media) {
            return notFound('Media not found.');
        }

        await prisma.listMediaItem.upsert({
            where: {
                listId_mediaId: {
                    listId,
                    mediaId,
                },
            },
            create: {
                listId,
                mediaId,
            },
            update: {},
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/media/${mediaId}`, 'page');
        revalidatePath(
            `/${locale}/profile/${currentUserId}/list/${listId}`,
            'page'
        );

        logger.info('PUT /api/list', {
            userId: currentUserId,
            mediaId,
            listId,
        });

        return NextResponse.json(
            { message: 'Item added successfully' },
            { status: 200 }
        );
    } catch (error) {
        logger.error('PUT /api/list', { error });
        return internalServerError('Failed to add item to list');
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to remove item from a list.'
            );
        }

        const currentUserId = session.user.id;

        const { mediaId, listId } = (await request.json()) as {
            mediaId: string;
            listId: string;
        };

        if (!mediaId || !listId) {
            return invalidInput('mediaId and listId are required');
        }

        const list = await prisma.list.findUnique({
            where: { id: listId },
            select: { userId: true },
        });

        if (!list) {
            return notFound('List not found.');
        }

        if (list.userId !== currentUserId) {
            return unauthorized('Cannot modify a list you do not own.');
        }

        const existingItem = await prisma.listMediaItem.findUnique({
            where: {
                listId_mediaId: {
                    listId,
                    mediaId,
                },
            },
        });

        if (!existingItem) {
            return notFound('Item not found in list.');
        }

        await prisma.listMediaItem.delete({
            where: {
                listId_mediaId: {
                    listId,
                    mediaId,
                },
            },
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/media/${mediaId}`, 'page');
        revalidatePath(
            `/${locale}/profile/${currentUserId}/list/${listId}`,
            'page'
        );

        logger.info('DELETE /api/list', {
            userId: currentUserId,
            mediaId,
            listId,
        });

        return NextResponse.json(
            { message: 'Item removed successfully' },
            { status: 200 }
        );
    } catch (error) {
        logger.error('DELETE /api/list', { error });
        return internalServerError('Failed to remove item from list');
    }
}

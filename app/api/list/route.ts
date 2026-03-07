import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import { LOCALES } from '@/lib/constants';
import {
    internalServerError,
    invalidInput,
    notFound,
    unauthorized,
} from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

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

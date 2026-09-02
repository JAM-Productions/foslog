import { forbidden, notFound, unauthorized } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { ListType } from '@prisma/client';

/**
 * Loads the list and checks the caller may manage it. Bookmark lists are
 * managed by the app, so they can be neither edited, deleted nor shared.
 */
export const findManageableList = async (
    listId: string,
    currentUserId: string
) => {
    const list = await prisma.list.findUnique({
        where: { id: listId },
        select: { id: true, userId: true, type: true, isPublic: true },
    });

    if (!list) {
        return { error: notFound('List not found.') };
    }

    if (list.userId !== currentUserId) {
        return { error: unauthorized('Cannot modify a list you do not own.') };
    }

    if (list.type === ListType.BOOKMARK) {
        return { error: forbidden('The bookmark list cannot be modified.') };
    }

    return { list };
};

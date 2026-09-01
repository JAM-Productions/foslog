import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import { LOCALES } from '@/lib/constants';
import { internalServerError, invalidInput, unauthorized } from '@/lib/errors';
import { findManageableList } from '@/lib/list-access';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Flips a list between private (owner only) and public. Kept apart from the
 * list PATCH so toggling visibility never touches name, description or image.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ listId: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to change a list visibility.'
            );
        }

        const currentUserId = session.user.id;
        const { listId } = await params;

        const { isPublic } = (await request.json()) as { isPublic?: unknown };

        if (typeof isPublic !== 'boolean') {
            return invalidInput('isPublic must be a boolean');
        }

        const { error } = await findManageableList(listId, currentUserId);
        if (error) {
            return error;
        }

        const list = await prisma.list.update({
            where: { id: listId },
            data: { isPublic },
            select: { id: true, isPublic: true },
        });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/profile/${currentUserId}`, 'page');
        revalidatePath(`/${locale}/profile/${currentUserId}/lists`, 'page');
        revalidatePath(
            `/${locale}/profile/${currentUserId}/list/${listId}`,
            'page'
        );

        logger.info('PATCH /api/list/[listId]/visibility', {
            userId: currentUserId,
            listId,
            isPublic,
        });

        return NextResponse.json(
            { message: 'List visibility updated successfully', list },
            { status: 200 }
        );
    } catch (error) {
        logger.error('PATCH /api/list/[listId]/visibility', { error });
        return internalServerError('Failed to update list visibility');
    }
}

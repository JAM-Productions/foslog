import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import {
    LOCALES,
    MAX_LIST_DESCRIPTION_LENGTH,
    MAX_LIST_IMAGE_LENGTH,
    MAX_LIST_NAME_LENGTH,
    MIN_LIST_NAME_LENGTH,
} from '@/lib/constants';
import { internalServerError, invalidInput, unauthorized } from '@/lib/errors';
import { findManageableList } from '@/lib/list-access';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ listId: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized('Unauthorized. Please log in to edit a list.');
        }

        const currentUserId = session.user.id;
        const { listId } = await params;

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

        const { error } = await findManageableList(listId, currentUserId);
        if (error) {
            return error;
        }

        const list = await prisma.list.update({
            where: { id: listId },
            data: {
                name: trimmedName,
                description: trimmedDescription,
                image: image ?? null,
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
        revalidatePath(
            `/${locale}/profile/${currentUserId}/list/${listId}`,
            'page'
        );

        logger.info('PATCH /api/list/[listId]', {
            userId: currentUserId,
            listId,
        });

        return NextResponse.json(
            { message: 'List updated successfully', list },
            { status: 200 }
        );
    } catch (error) {
        logger.error('PATCH /api/list/[listId]', { error });
        return internalServerError('Failed to update list');
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ listId: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session) {
            return unauthorized(
                'Unauthorized. Please log in to delete a list.'
            );
        }

        const currentUserId = session.user.id;
        const { listId } = await params;

        const { error } = await findManageableList(listId, currentUserId);
        if (error) {
            return error;
        }

        // The list items cascade with the list.
        await prisma.list.delete({ where: { id: listId } });

        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/profile/${currentUserId}`, 'page');
        revalidatePath(`/${locale}/profile/${currentUserId}/lists`, 'page');

        logger.info('DELETE /api/list/[listId]', {
            userId: currentUserId,
            listId,
        });

        return NextResponse.json(
            { message: 'List deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        logger.error('DELETE /api/list/[listId]', { error });
        return internalServerError('Failed to delete list');
    }
}

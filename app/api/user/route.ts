import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import { internalServerError, unauthorized, badRequest } from '@/lib/errors';
import { LOCALES } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return unauthorized(
                'Unauthorized. Please log in to delete account.'
            );
        }

        const userId = session.user.id;

        try {
            await auth.api.signOut({
                headers: request.headers,
            });
        } catch (signOutError) {
            logger.warn('Sign-out failed during user deletion', {
                signOutError,
            });
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        logger.info('User deleted', { userId });

        return NextResponse.json(
            { message: 'User deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        logger.error('Error deleting user', { error });
        return internalServerError('Failed to delete user');
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return unauthorized(
                'Unauthorized. Please log in to update your name.'
            );
        }

        const userId = session.user.id;
        const { name, image } = await request.json();

        if (name && (typeof name !== 'string' || name.trim().length < 2)) {
            return badRequest('Name must be at least 2 characters long');
        }

        if (
            image !== undefined &&
            image !== null &&
            typeof image !== 'string'
        ) {
            return badRequest('Invalid image format');
        }

        const dataToUpdate: { name?: string; image?: string | null } = {};
        if (name) dataToUpdate.name = name.trim();
        if (image !== undefined) dataToUpdate.image = image;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: { id: true, name: true, image: true },
        });
        const referer = request.headers.get('referer') || '';
        const locale =
            LOCALES.find((loc) => referer.includes(`/${loc}/`)) || 'en';
        revalidatePath(`/${locale}/profile/${updatedUser.id}`, 'page');
        if (name)
            logger.info('User name updated', {
                userId,
                newName: updatedUser.name,
            });
        if (image !== undefined) logger.info('User image updated', { userId });

        return NextResponse.json(
            { message: 'User updated successfully', user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        logger.error('Error updating user name', { error });
        return internalServerError('Failed to update user name');
    }
}

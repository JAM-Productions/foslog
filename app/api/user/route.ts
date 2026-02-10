import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import { internalServerError, unauthorized } from '@/lib/errors';

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

        // Sign out the user before deletion to avoid issues with cascading deletes
        try {
            await auth.api.signOut({
                headers: request.headers,
            });
        } catch (signOutError) {
            // Best-effort sign-out, continue with deletion even if it fails
            logger.warn('Sign-out failed during user deletion', {
                signOutError,
            });
        }

        // Delete user - cascading deletes will handle related records
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
        const { name } = await request.json();

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return NextResponse.json(
                { message: 'Name must be at least 2 characters long' },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name: name.trim() },
        });

        logger.info('User name updated', { userId, newName: updatedUser.name });

        return NextResponse.json(
            { message: 'Name updated successfully', user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        logger.error('Error updating user name', { error });
        return internalServerError('Failed to update user name');
    }
}

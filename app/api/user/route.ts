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
            return unauthorized('Unauthorized. Please log in to delete account.');
        }

        const userId = session.user.id;

        // Sign out the user before deletion to avoid issues with cascading deletes
        try {
            await auth.api.signOut({
                headers: request.headers,
            });
        } catch (signOutError) {
            // Best-effort sign-out, continue with deletion even if it fails
            logger.warn('Sign-out failed during user deletion', { signOutError });
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

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

        // Delete user - cascading deletes will handle related records
        await prisma.user.delete({
            where: { id: userId },
        });

        logger.info('User deleted', { userId });

        // Sign out the user
        await auth.api.signOut({
            headers: request.headers,
        });

        return NextResponse.json(
            { message: 'User deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        logger.error('Error deleting user', { error });
        return internalServerError('Failed to delete user');
    }
}

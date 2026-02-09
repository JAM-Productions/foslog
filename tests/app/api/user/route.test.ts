import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { DELETE } from '@/app/api/user/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { NextRequest } from 'next/server';
import { ApiErrorType } from '@/lib/errors';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            delete: vi.fn(),
        },
    },
}));

vi.mock('@/lib/auth/auth', () => ({
    auth: {
        api: {
            getSession: vi.fn(),
            signOut: vi.fn(),
        },
    },
}));

vi.mock('@/lib/axiom/server', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe('DELETE /api/user', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRequest = () => {
        return {
            headers: new Headers({ 'Content-Type': 'application/json' }),
        } as unknown as NextRequest;
    };

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);
        const req = mockRequest();
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
        expect(data.error).toBe('Unauthorized. Please log in to delete account.');
        expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should return 200 on successful user deletion', async () => {
        const mockUserId = 'user-123';
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: mockUserId },
        });
        (auth.api.signOut as unknown as Mock).mockResolvedValue(undefined);
        (prisma.user.delete as unknown as Mock).mockResolvedValue({ id: mockUserId });

        const req = mockRequest();
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('User deleted successfully');
        expect(auth.api.signOut).toHaveBeenCalledWith({
            headers: expect.any(Headers),
        });
        expect(prisma.user.delete).toHaveBeenCalledWith({
            where: { id: mockUserId },
        });
    });

    it('should return 500 when prisma.user.delete throws an error', async () => {
        const mockUserId = 'user-123';
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: mockUserId },
        });
        (auth.api.signOut as unknown as Mock).mockResolvedValue(undefined);
        (prisma.user.delete as unknown as Mock).mockRejectedValue(
            new Error('Database error')
        );

        const req = mockRequest();
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.code).toBe(ApiErrorType.INTERNAL_SERVER_ERROR);
        expect(data.error).toBe('Failed to delete user');
    });

    it('should continue deletion even if signOut fails', async () => {
        const mockUserId = 'user-123';
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: mockUserId },
        });
        (auth.api.signOut as unknown as Mock).mockRejectedValue(
            new Error('Sign out failed')
        );
        (prisma.user.delete as unknown as Mock).mockResolvedValue({ id: mockUserId });

        const req = mockRequest();
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('User deleted successfully');
        expect(prisma.user.delete).toHaveBeenCalledWith({
            where: { id: mockUserId },
        });
    });

    it('should sign out before deleting the user', async () => {
        const mockUserId = 'user-123';
        const callOrder: string[] = [];

        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: mockUserId },
        });
        (auth.api.signOut as unknown as Mock).mockImplementation(async () => {
            callOrder.push('signOut');
        });
        (prisma.user.delete as unknown as Mock).mockImplementation(async () => {
            callOrder.push('delete');
            return { id: mockUserId };
        });

        const req = mockRequest();
        await DELETE(req);

        expect(callOrder).toEqual(['signOut', 'delete']);
    });
});

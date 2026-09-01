import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { PATCH } from '@/app/api/list/[listId]/visibility/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { NextRequest } from 'next/server';
import { ApiErrorType } from '@/lib/errors';

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        list: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock('@/lib/auth/auth', () => ({
    auth: {
        api: {
            getSession: vi.fn(),
        },
    },
}));

vi.mock('@/lib/axiom/server', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

const params = Promise.resolve({ listId: 'list1' });

const mockRequest = (
    body?: any,
    referer = 'http://localhost:3000/en/profile/user1/list/list1'
) =>
    ({
        headers: new Headers({
            'Content-Type': 'application/json',
            referer,
        }),
        json: () => Promise.resolve(body ?? { isPublic: true }),
    }) as unknown as NextRequest;

const authenticate = (userId = 'user1') => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({
        user: { id: userId },
    });
};

const ownedList = (type: 'LIST' | 'BOOKMARK' = 'LIST', userId = 'user1') => ({
    id: 'list1',
    userId,
    type,
    isPublic: false,
});

describe('PATCH /api/list/[listId]/visibility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);

        const response = await PATCH(mockRequest(), { params });

        expect(response.status).toBe(401);
        expect(prisma.list.update).not.toHaveBeenCalled();
    });

    it('should return 400 when isPublic is missing', async () => {
        authenticate();

        const response = await PATCH(mockRequest({}), { params });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('isPublic must be a boolean');
    });

    it('should return 400 when isPublic is not a boolean', async () => {
        authenticate();

        const response = await PATCH(mockRequest({ isPublic: 'yes' }), {
            params,
        });

        expect(response.status).toBe(400);
        expect(prisma.list.update).not.toHaveBeenCalled();
    });

    it('should return 404 when the list does not exist', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(null);

        const response = await PATCH(mockRequest(), { params });

        expect(response.status).toBe(404);
        expect(prisma.list.update).not.toHaveBeenCalled();
    });

    it('should return 401 when the list belongs to another user', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(
            ownedList('LIST', 'someoneElse')
        );

        const response = await PATCH(mockRequest(), { params });

        expect(response.status).toBe(401);
        expect(prisma.list.update).not.toHaveBeenCalled();
    });

    it('should refuse to publish the bookmark list', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(
            ownedList('BOOKMARK')
        );

        const response = await PATCH(mockRequest(), { params });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.code).toBe(ApiErrorType.FORBIDDEN);
        expect(prisma.list.update).not.toHaveBeenCalled();
    });

    it('should make the list public', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(ownedList());
        (prisma.list.update as Mock).mockResolvedValue({
            id: 'list1',
            isPublic: true,
        });

        const response = await PATCH(mockRequest({ isPublic: true }), {
            params,
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(prisma.list.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'list1' },
                data: { isPublic: true },
            })
        );
        expect(data.list.isPublic).toBe(true);
    });

    it('should make the list private again', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(ownedList());
        (prisma.list.update as Mock).mockResolvedValue({
            id: 'list1',
            isPublic: false,
        });

        await PATCH(mockRequest({ isPublic: false }), { params });

        expect(prisma.list.update).toHaveBeenCalledWith(
            expect.objectContaining({ data: { isPublic: false } })
        );
    });

    it('should return 500 when the database fails', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(ownedList());
        (prisma.list.update as Mock).mockRejectedValue(
            new Error('database failure')
        );

        const response = await PATCH(mockRequest(), { params });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to update list visibility');
    });
});

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { DELETE } from '@/app/api/list/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { NextRequest } from 'next/server';
import { ApiErrorType } from '@/lib/errors';

// mock dependencies that the route uses
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        list: {
            findUnique: vi.fn(),
        },
        listMediaItem: {
            findUnique: vi.fn(),
            delete: vi.fn(),
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
        error: vi.fn(),
    },
}));

describe('DELETE /api/list', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRequest = (
        body?: any,
        referer = 'http://localhost:3000/en/media/media1'
    ) => {
        return {
            headers: new Headers({
                'Content-Type': 'application/json',
                referer,
            }),
            json: () =>
                Promise.resolve(body ?? { mediaId: 'media1', listId: 'list1' }),
        } as unknown as NextRequest;
    };

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);
        const req = mockRequest();
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
        expect(data.error).toBe(
            'Unauthorized. Please log in to remove item from a list.'
        );
        expect(prisma.list.findUnique).not.toHaveBeenCalled();
    });

    it('should return 400 Invalid Input if mediaId or listId are missing', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        const req = mockRequest({ mediaId: 'media1' });
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.code).toBe(ApiErrorType.INVALID_INPUT);
        expect(data.error).toBe('mediaId and listId are required');
    });

    it('should return 404 Not Found if list does not exist', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.list.findUnique as Mock).mockResolvedValue(null);

        const req = mockRequest();
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.code).toBe(ApiErrorType.NOT_FOUND);
        expect(data.error).toBe('List not found.');
    });

    it('should return 401 Unauthorized if current user does not own the list', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'otherUser' },
        });
        (prisma.list.findUnique as Mock).mockResolvedValue({ userId: 'user1' });

        const req = mockRequest();
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
        expect(data.error).toBe('Cannot modify a list you do not own.');
    });

    it('should return 404 Not Found if item is not in the list', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.list.findUnique as Mock).mockResolvedValue({ userId: 'user1' });
        (prisma.listMediaItem.findUnique as Mock).mockResolvedValue(null);

        const req = mockRequest();
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.code).toBe(ApiErrorType.NOT_FOUND);
        expect(data.error).toBe('Item not found in list.');
    });

    it('should delete the item and revalidate the correct paths', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.list.findUnique as Mock).mockResolvedValue({ userId: 'user1' });
        (prisma.listMediaItem.findUnique as Mock).mockResolvedValue({
            id: 'item1',
        });
        (prisma.listMediaItem.delete as Mock).mockResolvedValue({});

        const req = mockRequest(
            undefined,
            'http://localhost:3000/es/media/media1'
        );
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Item removed successfully');
        expect(prisma.listMediaItem.delete).toHaveBeenCalledWith({
            where: {
                listId_mediaId: { listId: 'list1', mediaId: 'media1' },
            },
        });

        const { revalidatePath } = await import('next/cache');
        expect(revalidatePath).toHaveBeenCalledWith('/es/media/media1', 'page');
        expect(revalidatePath).toHaveBeenCalledWith(
            '/es/profile/user1/list/list1',
            'page'
        );
    });

    it('should return 500 Internal Server Error if deletion fails', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.list.findUnique as Mock).mockResolvedValue({ userId: 'user1' });
        (prisma.listMediaItem.findUnique as Mock).mockResolvedValue({
            id: 'item1',
        });
        (prisma.listMediaItem.delete as Mock).mockRejectedValue(
            new Error('database failure')
        );

        const req = mockRequest();
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.code).toBe(ApiErrorType.INTERNAL_SERVER_ERROR);
        expect(data.error).toBe('Failed to remove item from list');
    });
});

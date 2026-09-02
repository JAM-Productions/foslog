import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { DELETE, PATCH } from '@/app/api/list/[listId]/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { NextRequest } from 'next/server';
import { ApiErrorType } from '@/lib/errors';
import {
    MAX_LIST_DESCRIPTION_LENGTH,
    MAX_LIST_IMAGE_LENGTH,
    MAX_LIST_NAME_LENGTH,
} from '@/lib/constants';

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        list: {
            findUnique: vi.fn(),
            update: vi.fn(),
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
        json: () => Promise.resolve(body ?? { name: 'Essential movies' }),
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
});

describe('PATCH /api/list/[listId]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);

        const response = await PATCH(mockRequest(), { params });

        expect(response.status).toBe(401);
        expect(prisma.list.update).not.toHaveBeenCalled();
    });

    it('should return 400 when the name is missing', async () => {
        authenticate();

        const response = await PATCH(mockRequest({}), { params });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('name is required');
    });

    it('should return 400 when the name is too long', async () => {
        authenticate();

        const response = await PATCH(
            mockRequest({ name: 'a'.repeat(MAX_LIST_NAME_LENGTH + 1) }),
            { params }
        );

        expect(response.status).toBe(400);
        expect(prisma.list.update).not.toHaveBeenCalled();
    });

    it('should return 400 when the description is too long', async () => {
        authenticate();

        const response = await PATCH(
            mockRequest({
                name: 'Essential movies',
                description: 'a'.repeat(MAX_LIST_DESCRIPTION_LENGTH + 1),
            }),
            { params }
        );

        expect(response.status).toBe(400);
    });

    it('should return 400 when the image is not a data URL', async () => {
        authenticate();

        const response = await PATCH(
            mockRequest({
                name: 'Essential movies',
                image: 'https://example.com/cover.jpg',
            }),
            { params }
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid image format');
    });

    it('should return 400 when the image is too large', async () => {
        authenticate();

        const response = await PATCH(
            mockRequest({
                name: 'Essential movies',
                image: `data:image/jpeg;base64,${'a'.repeat(MAX_LIST_IMAGE_LENGTH)}`,
            }),
            { params }
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Image is too large');
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
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Cannot modify a list you do not own.');
        expect(prisma.list.update).not.toHaveBeenCalled();
    });

    it('should refuse to edit the bookmark list', async () => {
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

    it('should update the list with trimmed values', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(ownedList());
        (prisma.list.update as Mock).mockResolvedValue({
            id: 'list1',
            name: 'Essential movies',
            description: 'My picks',
            type: 'LIST',
        });

        const response = await PATCH(
            mockRequest({
                name: '  Essential movies  ',
                description: '  My picks  ',
                image: 'data:image/jpeg;base64,abc',
            }),
            { params }
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(prisma.list.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'list1' },
                data: {
                    name: 'Essential movies',
                    description: 'My picks',
                    image: 'data:image/jpeg;base64,abc',
                },
            })
        );
        expect(data.list.id).toBe('list1');
    });

    it('should clear the image and description when omitted', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(ownedList());
        (prisma.list.update as Mock).mockResolvedValue({ id: 'list1' });

        await PATCH(mockRequest({ name: 'Essential movies' }), { params });

        expect(prisma.list.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    description: null,
                    image: null,
                }),
            })
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
        expect(data.error).toBe('Failed to update list');
    });
});

describe('DELETE /api/list/[listId]', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);

        const response = await DELETE(mockRequest(), { params });

        expect(response.status).toBe(401);
        expect(prisma.list.delete).not.toHaveBeenCalled();
    });

    it('should return 404 when the list does not exist', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(null);

        const response = await DELETE(mockRequest(), { params });

        expect(response.status).toBe(404);
        expect(prisma.list.delete).not.toHaveBeenCalled();
    });

    it('should return 401 when the list belongs to another user', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(
            ownedList('LIST', 'someoneElse')
        );

        const response = await DELETE(mockRequest(), { params });

        expect(response.status).toBe(401);
        expect(prisma.list.delete).not.toHaveBeenCalled();
    });

    it('should refuse to delete the bookmark list', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(
            ownedList('BOOKMARK')
        );

        const response = await DELETE(mockRequest(), { params });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.code).toBe(ApiErrorType.FORBIDDEN);
        expect(prisma.list.delete).not.toHaveBeenCalled();
    });

    it('should delete the list', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(ownedList());
        (prisma.list.delete as Mock).mockResolvedValue({ id: 'list1' });

        const response = await DELETE(mockRequest(), { params });

        expect(response.status).toBe(200);
        expect(prisma.list.delete).toHaveBeenCalledWith({
            where: { id: 'list1' },
        });
    });

    it('should return 500 when the database fails', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(ownedList());
        (prisma.list.delete as Mock).mockRejectedValue(
            new Error('database failure')
        );

        const response = await DELETE(mockRequest(), { params });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to delete list');
    });
});

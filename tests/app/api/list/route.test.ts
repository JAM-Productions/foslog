import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { DELETE, GET, POST, PUT } from '@/app/api/list/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { NextRequest } from 'next/server';
import { ApiErrorType } from '@/lib/errors';
import {
    MAX_LIST_DESCRIPTION_LENGTH,
    MAX_LIST_IMAGE_LENGTH,
    MAX_LIST_NAME_LENGTH,
    MAX_LISTS_PER_USER,
} from '@/lib/constants';

// mock dependencies that the route uses
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        list: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
            create: vi.fn(),
        },
        listMediaItem: {
            findUnique: vi.fn(),
            delete: vi.fn(),
            upsert: vi.fn(),
        },
        mediaItem: {
            findUnique: vi.fn(),
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

describe('GET /api/list', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRequest = (mediaId?: string) =>
        ({
            headers: new Headers({}),
            nextUrl: {
                searchParams: new URLSearchParams(
                    mediaId ? { mediaId } : undefined
                ),
            },
        }) as unknown as NextRequest;

    const listRow = (
        id: string,
        name: string,
        type: 'LIST' | 'BOOKMARK',
        contains: boolean,
        totalItems = 0
    ) => ({
        id,
        name,
        image: null,
        type,
        _count: { mediaItems: totalItems },
        mediaItems: contains ? [{ id: 'item1' }] : [],
    });

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);

        const response = await GET(mockRequest('media1'));

        expect(response.status).toBe(401);
        expect(prisma.list.findMany).not.toHaveBeenCalled();
    });

    it('should return 400 when mediaId is missing', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });

        const response = await GET(mockRequest());
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('mediaId is required');
    });

    it('should split the bookmark list from the rest and flag membership', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.list.findMany as Mock).mockResolvedValue([
            listRow('bookmark1', 'Bookmarks', 'BOOKMARK', true, 4),
            listRow('list1', 'Essential movies', 'LIST', false, 12),
            listRow('list2', 'To watch', 'LIST', true, 3),
        ]);

        const response = await GET(mockRequest('media1'));
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(prisma.list.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: 'user1' },
            })
        );
        expect(data.bookmark).toEqual({
            id: 'bookmark1',
            name: 'Bookmarks',
            type: 'BOOKMARK',
            totalItems: 4,
            containsMedia: true,
        });
        expect(data.lists).toHaveLength(2);
        expect(data.lists[0].containsMedia).toBe(false);
        expect(data.lists[1].containsMedia).toBe(true);
    });

    it('should return a null bookmark when the user has never bookmarked', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.list.findMany as Mock).mockResolvedValue([
            listRow('list1', 'Essential movies', 'LIST', false),
        ]);

        const data = await (await GET(mockRequest('media1'))).json();

        expect(data.bookmark).toBeNull();
        expect(data.lists).toHaveLength(1);
    });

    it('should return 500 when the database fails', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.list.findMany as Mock).mockRejectedValue(
            new Error('database failure')
        );

        const response = await GET(mockRequest('media1'));
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to fetch lists');
    });
});

describe('PUT /api/list', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRequest = (
        body?: any,
        referer = 'http://localhost:3000/en/media/media1'
    ) =>
        ({
            headers: new Headers({
                'Content-Type': 'application/json',
                referer,
            }),
            json: () =>
                Promise.resolve(body ?? { mediaId: 'media1', listId: 'list1' }),
        }) as unknown as NextRequest;

    const authenticate = (userId = 'user1') => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: userId },
        });
    };

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);

        const response = await PUT(mockRequest());

        expect(response.status).toBe(401);
        expect(prisma.listMediaItem.upsert).not.toHaveBeenCalled();
    });

    it('should return 400 when mediaId or listId is missing', async () => {
        authenticate();

        const response = await PUT(mockRequest({ mediaId: 'media1' }));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('mediaId and listId are required');
    });

    it('should return 404 when the list does not exist', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue(null);

        const response = await PUT(mockRequest());

        expect(response.status).toBe(404);
        expect(prisma.listMediaItem.upsert).not.toHaveBeenCalled();
    });

    it('should return 401 when the list belongs to another user', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue({
            userId: 'someoneElse',
        });

        const response = await PUT(mockRequest());
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe('Cannot modify a list you do not own.');
        expect(prisma.listMediaItem.upsert).not.toHaveBeenCalled();
    });

    it('should return 404 when the media does not exist', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue({ userId: 'user1' });
        (prisma.mediaItem.findUnique as Mock).mockResolvedValue(null);

        const response = await PUT(mockRequest());
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Media not found.');
        expect(prisma.listMediaItem.upsert).not.toHaveBeenCalled();
    });

    it('should add the media to the list', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue({ userId: 'user1' });
        (prisma.mediaItem.findUnique as Mock).mockResolvedValue({
            id: 'media1',
        });
        (prisma.listMediaItem.upsert as Mock).mockResolvedValue({
            id: 'item1',
        });

        const response = await PUT(mockRequest());

        expect(response.status).toBe(200);
        expect(prisma.listMediaItem.upsert).toHaveBeenCalledWith({
            where: { listId_mediaId: { listId: 'list1', mediaId: 'media1' } },
            create: { listId: 'list1', mediaId: 'media1' },
            update: {},
        });
    });

    it('should succeed when the media is already in the list', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue({ userId: 'user1' });
        (prisma.mediaItem.findUnique as Mock).mockResolvedValue({
            id: 'media1',
        });
        (prisma.listMediaItem.upsert as Mock).mockResolvedValue({
            id: 'item1',
        });

        const first = await PUT(mockRequest());
        const second = await PUT(mockRequest());

        expect(first.status).toBe(200);
        expect(second.status).toBe(200);
    });

    it('should return 500 when the database fails', async () => {
        authenticate();
        (prisma.list.findUnique as Mock).mockResolvedValue({ userId: 'user1' });
        (prisma.mediaItem.findUnique as Mock).mockResolvedValue({
            id: 'media1',
        });
        (prisma.listMediaItem.upsert as Mock).mockRejectedValue(
            new Error('database failure')
        );

        const response = await PUT(mockRequest());
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to add item to list');
    });
});

describe('POST /api/list', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRequest = (
        body?: any,
        referer = 'http://localhost:3000/en/profile/user1'
    ) => {
        return {
            headers: new Headers({
                'Content-Type': 'application/json',
                referer,
            }),
            json: () => Promise.resolve(body ?? { name: 'Essential movies' }),
        } as unknown as NextRequest;
    };

    const authenticate = (userId = 'user1') => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: userId },
        });
    };

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);

        const response = await POST(mockRequest());
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
        expect(prisma.list.create).not.toHaveBeenCalled();
    });

    it('should return 400 when name is missing', async () => {
        authenticate();

        const response = await POST(mockRequest({}));
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.code).toBe(ApiErrorType.INVALID_INPUT);
        expect(data.error).toBe('name is required');
    });

    it('should return 400 when name is too short', async () => {
        authenticate();

        const response = await POST(mockRequest({ name: ' a ' }));

        expect(response.status).toBe(400);
        expect(prisma.list.create).not.toHaveBeenCalled();
    });

    it('should return 400 when name is too long', async () => {
        authenticate();

        const response = await POST(
            mockRequest({ name: 'a'.repeat(MAX_LIST_NAME_LENGTH + 1) })
        );

        expect(response.status).toBe(400);
        expect(prisma.list.create).not.toHaveBeenCalled();
    });

    it('should return 400 when description is too long', async () => {
        authenticate();

        const response = await POST(
            mockRequest({
                name: 'Essential movies',
                description: 'a'.repeat(MAX_LIST_DESCRIPTION_LENGTH + 1),
            })
        );

        expect(response.status).toBe(400);
        expect(prisma.list.create).not.toHaveBeenCalled();
    });

    it('should return 400 when image is not a data URL', async () => {
        authenticate();

        const response = await POST(
            mockRequest({
                name: 'Essential movies',
                image: 'https://example.com/image.jpg',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid image format');
        expect(prisma.list.create).not.toHaveBeenCalled();
    });

    it('should return 400 when image is too large', async () => {
        authenticate();

        const response = await POST(
            mockRequest({
                name: 'Essential movies',
                image: `data:image/jpeg;base64,${'a'.repeat(MAX_LIST_IMAGE_LENGTH)}`,
            })
        );
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Image is too large');
        expect(prisma.list.create).not.toHaveBeenCalled();
    });

    it('should return 409 when the user reached the list limit', async () => {
        authenticate();
        (prisma.list.count as Mock).mockResolvedValue(MAX_LISTS_PER_USER);

        const response = await POST(mockRequest());
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.code).toBe(ApiErrorType.CONFLICT);
        expect(prisma.list.create).not.toHaveBeenCalled();
    });

    it('should create the list and force the LIST type', async () => {
        authenticate();
        (prisma.list.count as Mock).mockResolvedValue(2);
        (prisma.list.create as Mock).mockResolvedValue({
            id: 'list1',
            name: 'Essential movies',
            description: null,
            type: 'LIST',
        });

        const response = await POST(
            mockRequest({
                name: '  Essential movies  ',
                description: '   ',
                type: 'BOOKMARK',
            })
        );
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(prisma.list.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    name: 'Essential movies',
                    description: null,
                    image: null,
                    userId: 'user1',
                    type: 'LIST',
                },
            })
        );
        expect(data.list.id).toBe('list1');
    });

    it('should store the trimmed description and the image', async () => {
        authenticate();
        (prisma.list.count as Mock).mockResolvedValue(0);
        (prisma.list.create as Mock).mockResolvedValue({ id: 'list1' });

        const image = 'data:image/jpeg;base64,abc';
        await POST(
            mockRequest({
                name: 'Essential movies',
                description: '  Movies everyone should watch  ',
                image,
            })
        );

        expect(prisma.list.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    description: 'Movies everyone should watch',
                    image,
                }),
            })
        );
    });

    it('should return 500 when the database fails', async () => {
        authenticate();
        (prisma.list.count as Mock).mockResolvedValue(0);
        (prisma.list.create as Mock).mockRejectedValue(
            new Error('database failure')
        );

        const response = await POST(mockRequest());
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.code).toBe(ApiErrorType.INTERNAL_SERVER_ERROR);
        expect(data.error).toBe('Failed to create list');
    });
});

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

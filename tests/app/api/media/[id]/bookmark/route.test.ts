import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST, DELETE } from '@/app/api/media/[id]/bookmark/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { NextRequest } from 'next/server';
import { ApiErrorType } from '@/lib/errors';
import { ListType, Prisma } from '@prisma/client';

// mocks
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        mediaItem: {
            findUnique: vi.fn(),
        },
        list: {
            findFirst: vi.fn(),
            create: vi.fn(),
        },
        listMediaItem: {
            findUnique: vi.fn(),
            create: vi.fn(),
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

describe('POST /api/media/[id]/bookmark', () => {
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
            json: () => Promise.resolve(body),
        } as unknown as NextRequest;
    };

    const mockParams = (id: string) => Promise.resolve({ id });

    it('unauthorized if not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);
        const req = mockRequest();
        const res = await POST(req, { params: mockParams('media1') });
        const data = await res.json();

        expect(res.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
        expect(data.error).toBe(
            'Unauthorized. Please log in to bookmark media.'
        );
        expect(prisma.mediaItem.findUnique).not.toHaveBeenCalled();
    });

    it('returns 404 if media not found', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.mediaItem.findUnique as Mock).mockResolvedValue(null);

        const req = mockRequest();
        const res = await POST(req, { params: mockParams('media1') });
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.code).toBe(ApiErrorType.NOT_FOUND);
        expect(data.error).toBe('Media not found.');
    });

    it('conflict when already bookmarked (existingBookmark)', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.mediaItem.findUnique as Mock).mockResolvedValue({
            id: 'media1',
            title: 'Title',
        });
        (prisma.list.findFirst as Mock).mockResolvedValue({
            id: 'list1',
            userId: 'user1',
            type: ListType.BOOKMARK,
        });
        (prisma.listMediaItem.findUnique as Mock).mockResolvedValue({
            id: 'item1',
        });

        const req = mockRequest();
        const res = await POST(req, { params: mockParams('media1') });
        const data = await res.json();

        expect(res.status).toBe(409);
        expect(data.code).toBe(ApiErrorType.CONFLICT);
        expect(data.error).toBe('Media is already bookmarked.');
    });

    it('creates bookmark successfully and revalidates', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.mediaItem.findUnique as Mock).mockResolvedValue({
            id: 'media1',
            title: 'Title',
        });
        (prisma.list.findFirst as Mock).mockResolvedValue(null);
        (prisma.list.create as Mock).mockResolvedValue({ id: 'list1' });
        (prisma.listMediaItem.findUnique as Mock).mockResolvedValue(null);
        (prisma.listMediaItem.create as Mock).mockResolvedValue({
            id: 'item1',
        });

        const req = mockRequest(
            undefined,
            'http://localhost:3000/es/media/media1'
        );
        const res = await POST(req, { params: mockParams('media1') });
        const data = await res.json();

        expect(res.status).toBe(201);
        expect(data.message).toBe('Media bookmarked successfully');

        expect(prisma.list.create).toHaveBeenCalledWith({
            data: {
                name: 'Bookmarks',
                userId: 'user1',
                type: ListType.BOOKMARK,
            },
        });
        expect(prisma.listMediaItem.create).toHaveBeenCalledWith({
            data: { listId: 'list1', mediaId: 'media1' },
        });

        const { revalidatePath } = await import('next/cache');
        expect(revalidatePath).toHaveBeenCalledWith('/es/media/media1', 'page');
        expect(revalidatePath).toHaveBeenCalledWith(
            '/es/profile/user1/list/list1',
            'page'
        );
    });

    it('handles unique constraint error on create', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.mediaItem.findUnique as Mock).mockResolvedValue({
            id: 'media1',
            title: 'Title',
        });
        (prisma.list.findFirst as Mock).mockResolvedValue({
            id: 'list1',
            userId: 'user1',
            type: ListType.BOOKMARK,
        });
        const prismaError = new Prisma.PrismaClientKnownRequestError('Unique', {
            code: 'P2002',
            clientVersion: '5.0.0',
        });
        (prisma.listMediaItem.create as Mock).mockRejectedValue(prismaError);

        const req = mockRequest();
        const res = await POST(req, { params: mockParams('media1') });
        const data = await res.json();

        expect(res.status).toBe(409);
        expect(data.code).toBe(ApiErrorType.CONFLICT);
        expect(data.error).toBe('Media is already bookmarked.');
    });

    it('returns 500 on unexpected error', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.mediaItem.findUnique as Mock).mockResolvedValue({
            id: 'media1',
            title: 'Title',
        });
        (prisma.list.findFirst as Mock).mockResolvedValue({
            id: 'list1',
            userId: 'user1',
            type: ListType.BOOKMARK,
        });
        (prisma.listMediaItem.create as Mock).mockRejectedValue(
            new Error('db')
        );

        const req = mockRequest();
        const res = await POST(req, { params: mockParams('media1') });
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.code).toBe(ApiErrorType.INTERNAL_SERVER_ERROR);
        expect(data.error).toBe('Failed to bookmark media');
    });
});

describe('DELETE /api/media/[id]/bookmark', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRequest = (referer = 'http://localhost:3000/en/media/media1') => {
        return {
            headers: new Headers({
                'Content-Type': 'application/json',
                referer,
            }),
        } as unknown as NextRequest;
    };

    const mockParams = (id: string) => Promise.resolve({ id });

    it('unauthorized when not logged in', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);
        const req = mockRequest();
        const res = await DELETE(req, { params: mockParams('media1') });
        const data = await res.json();

        expect(res.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
        expect(data.error).toBe(
            'Unauthorized. Please log in to remove bookmarks.'
        );
    });

    it('404 if bookmark list missing', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.list.findFirst as Mock).mockResolvedValue(null);

        const req = mockRequest();
        const res = await DELETE(req, { params: mockParams('media1') });
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.code).toBe(ApiErrorType.NOT_FOUND);
        expect(data.error).toBe('Bookmark list not found.');
    });

    it('404 if bookmark not found', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.list.findFirst as Mock).mockResolvedValue({
            id: 'list1',
            userId: 'user1',
            type: ListType.BOOKMARK,
        });
        (prisma.listMediaItem.findUnique as Mock).mockResolvedValue(null);

        const req = mockRequest();
        const res = await DELETE(req, { params: mockParams('media1') });
        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.code).toBe(ApiErrorType.NOT_FOUND);
        expect(data.error).toBe('Bookmark not found.');
    });

    it('deletes bookmark and revalidates', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.list.findFirst as Mock).mockResolvedValue({
            id: 'list1',
            userId: 'user1',
            type: ListType.BOOKMARK,
        });
        (prisma.listMediaItem.findUnique as Mock).mockResolvedValue({
            id: 'item1',
        });
        (prisma.listMediaItem.delete as Mock).mockResolvedValue({});

        const req = mockRequest('http://localhost:3000/es/media/media1');
        const res = await DELETE(req, { params: mockParams('media1') });
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.message).toBe('Bookmark removed successfully');
        expect(prisma.listMediaItem.delete).toHaveBeenCalledWith({
            where: { listId_mediaId: { listId: 'list1', mediaId: 'media1' } },
        });

        const { revalidatePath } = await import('next/cache');
        expect(revalidatePath).toHaveBeenCalledWith('/es/media/media1', 'page');
        expect(revalidatePath).toHaveBeenCalledWith(
            '/es/profile/user1/list/list1',
            'page'
        );
    });

    it('returns 500 on delete failure', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.list.findFirst as Mock).mockResolvedValue({
            id: 'list1',
            userId: 'user1',
            type: ListType.BOOKMARK,
        });
        (prisma.listMediaItem.findUnique as Mock).mockResolvedValue({
            id: 'item1',
        });
        (prisma.listMediaItem.delete as Mock).mockRejectedValue(
            new Error('boom')
        );

        const req = mockRequest();
        const res = await DELETE(req, { params: mockParams('media1') });
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.code).toBe(ApiErrorType.INTERNAL_SERVER_ERROR);
        expect(data.error).toBe('Failed to remove bookmark');
    });
});

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST, DELETE } from '@/app/api/user/[id]/follow/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { NextRequest } from 'next/server';
import { ApiErrorType } from '@/lib/errors';
import { Prisma } from '@prisma/client';

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
        follow: {
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
        warn: vi.fn(),
    },
}));

describe('POST /api/user/[id]/follow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRequest = () => {
        return {
            headers: new Headers({
                'Content-Type': 'application/json',
                referer: 'http://localhost:3000/en/profile/target-user',
            }),
        } as unknown as NextRequest;
    };

    const mockParams = (id: string) => Promise.resolve({ id });

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);
        const req = mockRequest();
        const response = await POST(req, { params: mockParams('target-user') });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
        expect(data.error).toBe(
            'Unauthorized. Please log in to follow an account.'
        );
        expect(prisma.follow.create).not.toHaveBeenCalled();
    });

    it('should return 409 Conflict if user tries to follow themselves', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        const req = mockRequest();
        const response = await POST(req, { params: mockParams('user1') });
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.code).toBe(ApiErrorType.CONFLICT);
        expect(data.error).toBe('You cannot follow yourself.');
        expect(prisma.follow.create).not.toHaveBeenCalled();
    });

    it('should follow user successfully and return 201', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.user.findUnique as Mock).mockResolvedValue({
            id: 'target-user',
        });
        (prisma.follow.create as Mock).mockResolvedValue({
            id: 'follow1',
            followerId: 'user1',
            followingId: 'target-user',
            createdAt: new Date(),
        });

        const req = mockRequest();
        const response = await POST(req, {
            params: mockParams('target-user'),
        });
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.message).toBe('User followed successfully');
        expect(prisma.follow.create).toHaveBeenCalledWith({
            data: {
                followerId: 'user1',
                followingId: 'target-user',
            },
        });
    });

    it('should return 409 Conflict if user already follows the target user', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.user.findUnique as Mock).mockResolvedValue({
            id: 'target-user',
        });

        const prismaError = new Prisma.PrismaClientKnownRequestError(
            'Unique constraint failed',
            {
                code: 'P2002',
                clientVersion: '5.0.0',
            }
        );

        (prisma.follow.create as Mock).mockRejectedValue(prismaError);

        const req = mockRequest();
        const response = await POST(req, {
            params: mockParams('target-user'),
        });
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.code).toBe(ApiErrorType.CONFLICT);
        expect(data.error).toBe('You are already following this user.');
    });

    it('should return 500 Internal Server Error on database failure', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.follow.create as Mock).mockRejectedValue(
            new Error('Database error')
        );

        const req = mockRequest();
        const response = await POST(req, {
            params: mockParams('target-user'),
        });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.code).toBe(ApiErrorType.INTERNAL_SERVER_ERROR);
        expect(data.error).toBe('Failed to follow user');
    });

    it('should use correct locale from referer for revalidation', async () => {
        const { revalidatePath } = await import('next/cache');
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.user.findUnique as Mock).mockResolvedValue({
            id: 'target-user',
        });
        (prisma.follow.create as Mock).mockResolvedValue({
            id: 'follow1',
            followerId: 'user1',
            followingId: 'target-user',
            createdAt: new Date(),
        });

        const req = {
            headers: new Headers({
                'Content-Type': 'application/json',
                referer: 'http://localhost:3000/es/profile/target-user',
            }),
        } as unknown as NextRequest;

        await POST(req, { params: mockParams('target-user') });

        expect(revalidatePath).toHaveBeenCalledWith(
            '/es/profile/target-user',
            'page'
        );
    });
});

describe('DELETE /api/user/[id]/follow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRequest = () => {
        return {
            headers: new Headers({
                'Content-Type': 'application/json',
                referer: 'http://localhost:3000/en/profile/target-user',
            }),
        } as unknown as NextRequest;
    };

    const mockParams = (id: string) => Promise.resolve({ id });

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);
        const req = mockRequest();
        const response = await DELETE(req, {
            params: mockParams('target-user'),
        });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
        expect(data.error).toBe(
            'Unauthorized. Please log in to unfollow an account.'
        );
        expect(prisma.follow.delete).not.toHaveBeenCalled();
    });

    it('should return 409 Conflict if user tries to unfollow themselves', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        const req = mockRequest();
        const response = await DELETE(req, { params: mockParams('user1') });
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.code).toBe(ApiErrorType.CONFLICT);
        expect(data.error).toBe('You cannot unfollow yourself.');
        expect(prisma.follow.delete).not.toHaveBeenCalled();
    });

    it('should unfollow user successfully and return 200', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.user.findUnique as Mock).mockResolvedValue({
            id: 'target-user',
        });
        (prisma.follow.delete as Mock).mockResolvedValue({
            id: 'follow1',
            followerId: 'user1',
            followingId: 'target-user',
            createdAt: new Date(),
        });

        const req = mockRequest();
        const response = await DELETE(req, {
            params: mockParams('target-user'),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('User unfollowed successfully');
        expect(prisma.follow.delete).toHaveBeenCalledWith({
            where: {
                followerId_followingId: {
                    followerId: 'user1',
                    followingId: 'target-user',
                },
            },
        });
    });

    it('should return 409 Conflict if user is not following the target user', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.user.findUnique as Mock).mockResolvedValue({
            id: 'target-user',
        });

        const prismaError = new Prisma.PrismaClientKnownRequestError(
            'Record not found',
            {
                code: 'P2025',
                clientVersion: '5.0.0',
            }
        );

        (prisma.follow.delete as Mock).mockRejectedValue(prismaError);

        const req = mockRequest();
        const response = await DELETE(req, {
            params: mockParams('target-user'),
        });
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.code).toBe(ApiErrorType.CONFLICT);
        expect(data.error).toBe('You are not following this user.');
    });

    it('should return 500 Internal Server Error on database failure', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.user.findUnique as Mock).mockResolvedValue({
            id: 'target-user',
        });
        (prisma.follow.delete as Mock).mockRejectedValue(
            new Error('Database error')
        );

        const req = mockRequest();
        const response = await DELETE(req, {
            params: mockParams('target-user'),
        });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.code).toBe(ApiErrorType.INTERNAL_SERVER_ERROR);
        expect(data.error).toBe('Failed to unfollow user');
    });

    it('should use correct locale from referer for revalidation', async () => {
        const { revalidatePath } = await import('next/cache');
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.user.findUnique as Mock).mockResolvedValue({
            id: 'target-user',
        });
        (prisma.follow.delete as Mock).mockResolvedValue({
            id: 'follow1',
            followerId: 'user1',
            followingId: 'target-user',
            createdAt: new Date(),
        });

        const req = {
            headers: new Headers({
                'Content-Type': 'application/json',
                referer: 'http://localhost:3000/ca/profile/target-user',
            }),
        } as unknown as NextRequest;

        await DELETE(req, { params: mockParams('target-user') });

        expect(revalidatePath).toHaveBeenCalledWith(
            '/ca/profile/target-user',
            'page'
        );
    });

    it('should default to "en" locale when referer is missing', async () => {
        const { revalidatePath } = await import('next/cache');
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.user.findUnique as Mock).mockResolvedValue({
            id: 'target-user',
        });
        (prisma.follow.delete as Mock).mockResolvedValue({
            id: 'follow1',
            followerId: 'user1',
            followingId: 'target-user',
            createdAt: new Date(),
        });

        const req = {
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
        } as unknown as NextRequest;

        await DELETE(req, { params: mockParams('target-user') });

        expect(revalidatePath).toHaveBeenCalledWith(
            '/en/profile/target-user',
            'page'
        );
    });
});

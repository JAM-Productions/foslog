import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST, DELETE, GET } from '@/app/api/user/[id]/follow/route';
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
            findMany: vi.fn(),
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

describe('GET /api/user/[id]/follow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRequest = () => {
        return {
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
        } as unknown as NextRequest;
    };

    const mockParams = (id: string) => Promise.resolve({ id });

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);
        const req = mockRequest();
        const response = await GET(req, { params: mockParams('target-user') });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
        expect(data.error).toBe(
            'Unauthorized. Please log in to view followers and following.'
        );
        expect(prisma.follow.findMany).not.toHaveBeenCalled();
    });

    it('should return 404 Not Found if user ID is missing', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        const req = mockRequest();
        const response = await GET(req, { params: mockParams('') });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.code).toBe(ApiErrorType.NOT_FOUND);
        expect(data.error).toBe('User ID is required.');
    });

    it('should return followers and following lists with correct isFollowing status', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'current-user' },
        });

        // Mock current user's following
        (prisma.follow.findMany as Mock)
            .mockResolvedValueOnce([
                { followingId: 'user2' },
                { followingId: 'user3' },
            ])
            // Mock target user's followers
            .mockResolvedValueOnce([
                {
                    follower: {
                        id: 'user2',
                        name: 'User 2',
                        image: '/user2.jpg',
                    },
                },
                {
                    follower: {
                        id: 'user4',
                        name: 'User 4',
                        image: null,
                    },
                },
            ])
            // Mock target user's following
            .mockResolvedValueOnce([
                {
                    following: {
                        id: 'user3',
                        name: 'User 3',
                        image: '/user3.jpg',
                    },
                },
                {
                    following: {
                        id: 'user5',
                        name: 'User 5',
                        image: null,
                    },
                },
            ]);

        const req = mockRequest();
        const response = await GET(req, {
            params: mockParams('target-user'),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.followers).toHaveLength(2);
        expect(data.following).toHaveLength(2);

        // Check followers with isFollowing status
        expect(data.followers[0]).toEqual({
            id: 'user2',
            name: 'User 2',
            image: '/user2.jpg',
            isFollowing: true, // current-user follows user2
        });
        expect(data.followers[1]).toEqual({
            id: 'user4',
            name: 'User 4',
            image: null,
            isFollowing: false, // current-user doesn't follow user4
        });

        // Check following with isFollowing status
        expect(data.following[0]).toEqual({
            id: 'user3',
            name: 'User 3',
            image: '/user3.jpg',
            isFollowing: true, // current-user follows user3
        });
        expect(data.following[1]).toEqual({
            id: 'user5',
            name: 'User 5',
            image: null,
            isFollowing: false, // current-user doesn't follow user5
        });
    });

    it('should return empty lists when user has no followers or following', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'current-user' },
        });

        (prisma.follow.findMany as Mock)
            .mockResolvedValueOnce([]) // current user following
            .mockResolvedValueOnce([]) // target user followers
            .mockResolvedValueOnce([]); // target user following

        const req = mockRequest();
        const response = await GET(req, {
            params: mockParams('target-user'),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.followers).toEqual([]);
        expect(data.following).toEqual([]);
    });

    it('should handle when current user is not following anyone', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'current-user' },
        });

        (prisma.follow.findMany as Mock)
            .mockResolvedValueOnce([]) // current user following (empty)
            .mockResolvedValueOnce([
                {
                    follower: {
                        id: 'user2',
                        name: 'User 2',
                        image: '/user2.jpg',
                    },
                },
            ])
            .mockResolvedValueOnce([
                {
                    following: {
                        id: 'user3',
                        name: 'User 3',
                        image: '/user3.jpg',
                    },
                },
            ]);

        const req = mockRequest();
        const response = await GET(req, {
            params: mockParams('target-user'),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.followers[0].isFollowing).toBe(false);
        expect(data.following[0].isFollowing).toBe(false);
    });

    it('should return 500 Internal Server Error on database failure', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'current-user' },
        });
        (prisma.follow.findMany as Mock).mockRejectedValue(
            new Error('Database error')
        );

        const req = mockRequest();
        const response = await GET(req, {
            params: mockParams('target-user'),
        });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.code).toBe(ApiErrorType.INTERNAL_SERVER_ERROR);
        expect(data.error).toBe('Failed to fetch followers and following');
    });

    it('should call prisma.follow.findMany with correct parameters', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'current-user' },
        });

        (prisma.follow.findMany as Mock)
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([]);

        const req = mockRequest();
        await GET(req, { params: mockParams('target-user') });

        // First call: get current user's following
        expect(prisma.follow.findMany).toHaveBeenNthCalledWith(1, {
            where: { followerId: 'current-user' },
            select: { followingId: true },
        });

        // Second call: get target user's followers
        expect(prisma.follow.findMany).toHaveBeenNthCalledWith(2, {
            where: { followingId: 'target-user' },
            select: {
                follower: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        // Third call: get target user's following
        expect(prisma.follow.findMany).toHaveBeenNthCalledWith(3, {
            where: { followerId: 'target-user' },
            select: {
                following: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });
    });
});

import {
    getUserProfile,
    getUserReviews,
    getUserStats,
    isFollowedByCurrentUser,
} from '@/app/actions/user';
import { prisma } from '@/lib/prisma';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        $transaction: vi.fn((args) => Promise.all(args)),
        user: {
            findUnique: vi.fn(),
        },
        review: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
        follow: {
            findUnique: vi.fn(),
        },
    },
}));

// Mock auth
vi.mock('@/lib/auth/auth', () => ({
    auth: {
        api: {
            getSession: vi.fn(),
        },
    },
}));

// Mock next/headers
vi.mock('next/headers', () => ({
    headers: vi.fn(),
}));

describe('User Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUserProfile', () => {
        test('should return user profile when found', async () => {
            const mockUser = {
                id: 'user1',
                name: 'Test User',
                email: 'test@example.com',
                image: 'image.jpg',
                bio: 'Bio',
                createdAt: new Date(),
                totalFollowers: 10,
                totalFollowing: 5,
            };

            vi.mocked(prisma.user.findUnique).mockResolvedValue(
                mockUser as any
            );

            const result = await getUserProfile('user1');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'user1' },
            });
            expect(result).toEqual({
                id: 'user1',
                name: 'Test User',
                email: '',
                image: 'image.jpg',
                bio: 'Bio',
                joinedAt: mockUser.createdAt,
                totalFollowers: 10,
                totalFollowing: 5,
            });
        });

        test('should return null when user not found', async () => {
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

            const result = await getUserProfile('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('getUserReviews', () => {
        test('should return user reviews with media', async () => {
            const mockReviews = [
                {
                    id: 'review1',
                    mediaId: 'media1',
                    userId: 'user1',
                    rating: 5,
                    liked: true,
                    review: 'Great!',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    totalComments: 0,
                    totalLikes: 10,
                    user: {
                        id: 'user1',
                        name: 'Test User',
                        createdAt: new Date(),
                        totalFollowers: 10,
                        totalFollowing: 5,
                    },
                    media: {
                        id: 'media1',
                        title: 'Movie',
                        type: 'FILM',
                        genre: ['Action'],
                        description: 'Desc',
                        averageRating: 4.5,
                        totalReviews: 10,
                        totalLikes: 5,
                        totalDislikes: 1,
                    },
                    consumedMoreThanOnce: true,
                },
            ];

            vi.mocked(prisma.review.findMany).mockResolvedValue(
                mockReviews as any
            );
            vi.mocked(prisma.review.count).mockResolvedValue(1);

            const result = await getUserReviews('user1');

            expect(prisma.review.findMany).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                include: { media: true, user: true },
                orderBy: { createdAt: 'desc' },
                skip: 0,
                take: 12,
            });
            expect(result.reviews).toHaveLength(1);
            expect(result.reviews[0].id).toBe('review1');
            expect(result.reviews[0].consumedMoreThanOnce).toBe(true);
            expect(result.total).toBe(1);
            expect(result.totalPages).toBe(1);
        });
    });

    describe('getUserStats', () => {
        test('should calculate stats correctly', async () => {
            const mockReviews = [
                {
                    rating: 5,
                    liked: true,
                    media: { genre: ['Action'] },
                },
                {
                    rating: 3,
                    liked: false,
                    media: { genre: ['Action', 'Comedy'] },
                },
                {
                    rating: 4,
                    liked: true,
                    media: { genre: ['Drama'] },
                },
            ];

            vi.mocked(prisma.review.findMany).mockResolvedValue(
                mockReviews as any
            );

            const result = await getUserStats('user1');

            expect(result.totalReviews).toBe(3);
            expect(result.totalLikesReceived).toBe(2);
            expect(result.averageRating).toBeCloseTo(4);
            expect(result.ratingDistribution).toEqual({
                5: 1,
                3: 1,
                4: 1,
            });
            expect(result.favoriteGenres).toEqual([
                { genre: 'Action', count: 2 },
                { genre: 'Comedy', count: 1 },
                { genre: 'Drama', count: 1 },
            ]);
        });
    });

    describe('isFollowedByCurrentUser', () => {
        test('should return false when user is not authenticated', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue(null);

            const result = await isFollowedByCurrentUser('targetUser');

            expect(result).toBe(false);
            expect(auth.api.getSession).toHaveBeenCalled();
        });

        test('should return true when user is following the target user', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'currentUser' },
                session: {},
            } as any);

            const mockFollow = {
                id: 'follow1',
                followerId: 'currentUser',
                followingId: 'targetUser',
                createdAt: new Date(),
            };

            vi.mocked(prisma.follow.findUnique).mockResolvedValue(
                mockFollow as any
            );

            const result = await isFollowedByCurrentUser('targetUser');

            expect(result).toBe(true);
            expect(prisma.follow.findUnique).toHaveBeenCalledWith({
                where: {
                    followerId_followingId: {
                        followerId: 'currentUser',
                        followingId: 'targetUser',
                    },
                },
            });
        });

        test('should return false when user is not following the target user', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'currentUser' },
                session: {},
            } as any);

            vi.mocked(prisma.follow.findUnique).mockResolvedValue(null);

            const result = await isFollowedByCurrentUser('targetUser');

            expect(result).toBe(false);
            expect(prisma.follow.findUnique).toHaveBeenCalledWith({
                where: {
                    followerId_followingId: {
                        followerId: 'currentUser',
                        followingId: 'targetUser',
                    },
                },
            });
        });

        test('should throw error when database query fails', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'currentUser' },
                session: {},
            } as any);

            vi.mocked(prisma.follow.findUnique).mockRejectedValue(
                new Error('Database error')
            );

            await expect(isFollowedByCurrentUser('targetUser')).rejects.toThrow(
                'Could not determine follow status.'
            );
        });
    });
});

import { getUserProfile, getUserReviews, getUserStats } from '@/app/actions/user';
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
    },
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
            };

            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

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
                    user: {
                        id: 'user1',
                        name: 'Test User',
                        createdAt: new Date(),
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

            vi.mocked(prisma.review.findMany).mockResolvedValue(mockReviews as any);
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

            vi.mocked(prisma.review.findMany).mockResolvedValue(mockReviews as any);

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
});

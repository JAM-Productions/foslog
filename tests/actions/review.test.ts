import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getReviewById } from '@/app/actions/review';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        review: {
            findUnique: vi.fn(),
        },
    },
}));

describe('getReviewById Server Action', () => {
    const mockDate = new Date('2023-01-01');

    const mockUser = {
        id: 'user1',
        name: 'Test User',
        image: 'user.jpg',
    };

    const mockMedia = {
        id: 'media1',
        title: 'Test Movie',
        type: 'FILM',
        year: 2023,
        director: 'Director 1',
        author: null,
        artist: null,
        genre: ['Action'],
        poster: 'poster.jpg',
        cover: null,
        description: 'Test description',
        averageRating: 4.5,
        totalReviews: 10,
        totalLikes: 5,
        totalDislikes: 1,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null if review is not found', async () => {
        (prisma.review.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        const result = await getReviewById('non-existent-id');

        expect(result).toBeNull();
        expect(prisma.review.findUnique).toHaveBeenCalledWith({
            where: { id: 'non-existent-id' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                media: true,
            },
        });
    });

    it('returns formatted review with rating only', async () => {
        const mockReview = {
            id: 'review1',
            mediaId: 'media1',
            userId: 'user1',
            rating: 5,
            liked: null,
            review: 'Great movie!',
            createdAt: mockDate,
            updatedAt: mockDate,
            user: mockUser,
            media: mockMedia,
        };

        (prisma.review.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockReview);

        const result = await getReviewById('review1');

        expect(result).toEqual({
            id: 'review1',
            mediaId: 'media1',
            userId: 'user1',
            rating: 5,
            liked: undefined,
            review: 'Great movie!',
            createdAt: mockDate,
            updatedAt: mockDate,
            user: {
                ...mockUser,
                email: '',
                bio: undefined,
                joinedAt: expect.any(Date),
            },
            media: {
                id: 'media1',
                title: 'Test Movie',
                type: 'film',
                year: 2023,
                director: 'Director 1',
                author: undefined,
                artist: undefined,
                genre: ['Action'],
                poster: 'poster.jpg',
                cover: undefined,
                description: 'Test description',
                averageRating: 4.5,
                totalReviews: 10,
                totalLikes: 5,
                totalDislikes: 1,
            },
        });
    });

    it('returns formatted review with like only', async () => {
        const mockReview = {
            id: 'review2',
            mediaId: 'media1',
            userId: 'user1',
            rating: null,
            liked: true,
            review: 'Liked it!',
            createdAt: mockDate,
            updatedAt: mockDate,
            user: mockUser,
            media: mockMedia,
        };

        (prisma.review.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockReview);

        const result = await getReviewById('review2');

        expect(result?.rating).toBeUndefined();
        expect(result?.liked).toBe(true);
    });

    it('returns formatted review with dislike only', async () => {
        const mockReview = {
            id: 'review3',
            mediaId: 'media1',
            userId: 'user1',
            rating: null,
            liked: false,
            review: 'Disliked it',
            createdAt: mockDate,
            updatedAt: mockDate,
            user: mockUser,
            media: mockMedia,
        };

        (prisma.review.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockReview);

        const result = await getReviewById('review3');

        expect(result?.rating).toBeUndefined();
        expect(result?.liked).toBe(false);
    });

    it('handles database errors gracefully', async () => {
        const dbError = new Error('Database connection failed');
        (prisma.review.findUnique as ReturnType<typeof vi.fn>).mockRejectedValue(dbError);

        await expect(getReviewById('review1')).rejects.toThrow('Could not fetch review.');
    });
});

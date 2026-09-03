import { getFeedReviews, getFeedReviewsPreview } from '@/app/actions/feed';
import { auth } from '@/lib/auth/auth';
import { FEED_WINDOW_DAYS } from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        $transaction: vi.fn((queries) => Promise.all(queries)),
        review: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
        follow: {
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

vi.mock('next/headers', () => ({
    headers: vi.fn(),
}));

const buildReview = (id: string, userId: string) => ({
    id,
    mediaId: 'media1',
    userId,
    rating: 4,
    liked: null,
    review: 'Solid',
    createdAt: new Date('2024-05-02'),
    updatedAt: new Date('2024-05-02'),
    consumedMoreThanOnce: false,
    consumedDate: new Date('2024-05-01'),
    totalComments: 1,
    totalLikes: 2,
    user: {
        id: userId,
        name: 'Reviewer',
        email: 'reviewer@example.com',
        image: null,
        bio: null,
        createdAt: new Date('2024-01-01'),
        totalFollowers: 3,
        totalFollowing: 4,
    },
    media: {
        id: 'media1',
        title: 'The Matrix',
        type: 'FILM',
        year: 1999,
        director: 'The Wachowskis',
        author: null,
        artist: null,
        genre: ['SciFi'],
        poster: 'poster.jpg',
        cover: null,
        description: 'Desc',
        averageRating: 4.5,
        totalReviews: 10,
        totalLikes: 5,
        totalDislikes: 1,
    },
});

const signIn = (userId: string | null) => {
    vi.mocked(auth.api.getSession).mockResolvedValue(
        (userId ? { user: { id: userId } } : null) as any
    );
};

const follows = (ids: string[]) => {
    vi.mocked(prisma.follow.findMany).mockResolvedValue(
        ids.map((followingId) => ({ followingId })) as any
    );
};

describe('Feed Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        signIn(null);
        follows([]);
        vi.mocked(prisma.review.count).mockResolvedValue(0);
        vi.mocked(prisma.review.findMany).mockResolvedValue([] as any);
    });

    describe('getFeedReviewsPreview', () => {
        test('only asks for reviews posted in the last 30 days', async () => {
            await getFeedReviewsPreview(12);

            const { where } = vi.mocked(prisma.review.findMany).mock
                .calls[0][0] as any;
            const expectedStart = new Date();
            expectedStart.setDate(expectedStart.getDate() - FEED_WINDOW_DAYS);

            expect(
                Math.abs(
                    where.createdAt.gte.getTime() - expectedStart.getTime()
                )
            ).toBeLessThan(5000);
        });

        test('orders by post date with a stable tiebreaker', async () => {
            await getFeedReviewsPreview(12);

            expect(prisma.review.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
                })
            );
        });

        test('falls back to a chronological feed for anonymous visitors', async () => {
            vi.mocked(prisma.review.findMany).mockResolvedValue([
                buildReview('review1', 'someone'),
            ] as any);
            vi.mocked(prisma.review.count).mockResolvedValue(30);

            const result = await getFeedReviewsPreview(12);

            expect(prisma.follow.findMany).not.toHaveBeenCalled();
            expect(prisma.review.findMany).toHaveBeenCalledTimes(1);
            expect(
                (vi.mocked(prisma.review.findMany).mock.calls[0][0] as any)
                    .where.userId
            ).toBeUndefined();
            expect(result.total).toBe(30);
            expect(result.reviews).toHaveLength(1);
        });

        test('leads with followed reviews and tops the rest up', async () => {
            signIn('viewer');
            follows(['followed1']);
            vi.mocked(prisma.review.findMany)
                .mockResolvedValueOnce([
                    buildReview('followed-review', 'followed1'),
                ] as any)
                .mockResolvedValueOnce([
                    buildReview('other-review', 'stranger'),
                ] as any);
            vi.mocked(prisma.review.count).mockResolvedValue(20);

            const result = await getFeedReviewsPreview(3);

            const [followedCall, otherCall] = vi.mocked(prisma.review.findMany)
                .mock.calls as any[];
            expect(followedCall[0].where.userId).toEqual({
                in: ['followed1'],
            });
            expect(followedCall[0].take).toBe(3);
            expect(otherCall[0].where.userId).toEqual({
                notIn: ['followed1'],
            });
            // Only the slots the followed reviews left empty.
            expect(otherCall[0].take).toBe(2);
            expect(result.reviews.map((review) => review.id)).toEqual([
                'followed-review',
                'other-review',
            ]);
        });

        test('skips the top up when followed reviews fill the preview', async () => {
            signIn('viewer');
            follows(['followed1']);
            vi.mocked(prisma.review.findMany).mockResolvedValueOnce([
                buildReview('a', 'followed1'),
                buildReview('b', 'followed1'),
            ] as any);

            const result = await getFeedReviewsPreview(2);

            expect(prisma.review.findMany).toHaveBeenCalledTimes(1);
            expect(result.reviews).toHaveLength(2);
        });

        test('maps rows without leaking emails', async () => {
            vi.mocked(prisma.review.findMany).mockResolvedValue([
                buildReview('review1', 'someone'),
            ] as any);

            const [review] = (await getFeedReviewsPreview(12)).reviews;

            expect(review.user.email).toBe('');
            expect(review.media.type).toBe('film');
            expect(review.liked).toBeUndefined();
        });

        test('returns an empty preview instead of breaking the home page', async () => {
            vi.mocked(prisma.review.count).mockRejectedValue(
                new Error('db is down')
            );

            await expect(getFeedReviewsPreview(12)).resolves.toEqual({
                reviews: [],
                total: 0,
            });
        });
    });

    describe('getFeedReviews', () => {
        test('pages through every recent review', async () => {
            vi.mocked(prisma.review.findMany).mockResolvedValue([
                buildReview('review1', 'someone'),
            ] as any);
            vi.mocked(prisma.review.count).mockResolvedValue(25);

            const result = await getFeedReviews(2, 12, 'all');

            expect(prisma.review.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 12, take: 12 })
            );
            expect(
                (vi.mocked(prisma.review.findMany).mock.calls[0][0] as any)
                    .where.userId
            ).toBeUndefined();
            expect(result).toMatchObject({
                total: 25,
                totalPages: 3,
                currentPage: 2,
            });
        });

        test('narrows the feed to the people the viewer follows', async () => {
            signIn('viewer');
            follows(['followed1', 'followed2']);
            vi.mocked(prisma.review.findMany).mockResolvedValue([] as any);

            await getFeedReviews(1, 12, 'following');

            expect(
                (vi.mocked(prisma.review.findMany).mock.calls[0][0] as any)
                    .where.userId
            ).toEqual({ in: ['followed1', 'followed2'] });
        });

        test('returns nothing when the viewer follows nobody', async () => {
            signIn('viewer');
            follows([]);

            const result = await getFeedReviews(1, 12, 'following');

            expect(prisma.review.findMany).not.toHaveBeenCalled();
            expect(result).toEqual({
                reviews: [],
                total: 0,
                totalPages: 0,
                currentPage: 1,
            });
        });

        test('returns nothing for anonymous visitors on the following tab', async () => {
            const result = await getFeedReviews(1, 12, 'following');

            expect(prisma.follow.findMany).not.toHaveBeenCalled();
            expect(prisma.review.findMany).not.toHaveBeenCalled();
            expect(result.reviews).toEqual([]);
        });

        test('throws when the feed cannot be read', async () => {
            vi.mocked(prisma.$transaction).mockRejectedValueOnce(
                new Error('db is down')
            );

            await expect(getFeedReviews(1, 12, 'all')).rejects.toThrow(
                'Could not fetch feed reviews.'
            );
        });
    });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getMedias,
    getMediaById,
    getGlobalMediaStats,
    getMediaMetadata,
} from '@/app/actions/media';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/axiom/server';
import { redis } from '@/lib/redis';

// Mock Prisma client
vi.mock('@/lib/prisma', () => ({
    prisma: {
        mediaItem: {
            findMany: vi.fn(),
            count: vi.fn(),
            findUnique: vi.fn(),
            aggregate: vi.fn(),
        },
        review: {
            findMany: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

describe('getMedias Server Action', () => {
    const mockMediaItems = [
        {
            id: '1',
            title: 'Test Movie 1',
            type: 'FILM',
            year: 2023,
            director: 'Director 1',
            author: null,
            artist: null,
            genre: ['Action', 'Drama'],
            poster: 'poster1.jpg',
            cover: null,
            description: 'Test description 1',
            averageRating: 4.5,
            totalReviews: 10,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01'),
        },
        {
            id: '2',
            title: 'Test Movie 2',
            type: 'FILM',
            year: 2024,
            director: 'Director 2',
            author: null,
            artist: null,
            genre: ['Comedy'],
            poster: 'poster2.jpg',
            cover: null,
            description: 'Test description 2',
            averageRating: 3.8,
            totalReviews: 5,
            createdAt: new Date('2023-02-01'),
            updatedAt: new Date('2023-02-01'),
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock implementation for $transaction
        (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(
            async (queries) => {
                return Promise.all(queries);
            }
        );
    });

    describe('Pagination', () => {
        it('fetches first page with default page size', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mockMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(20);

            const result = await getMedias(1, 12);

            expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
                where: {},
                skip: 0,
                take: 12,
                orderBy: [
                    { averageRating: 'desc' },
                    { totalReviews: 'desc' },
                    { id: 'asc' },
                ],
            });
            expect(prisma.mediaItem.count).toHaveBeenCalled();
            expect(result.items).toHaveLength(2);
            expect(result.total).toBe(20);
        });

        it('fetches second page correctly', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mockMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(20);

            await getMedias(2, 12);

            expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
                where: {},
                skip: 12,
                take: 12,
                orderBy: [
                    { averageRating: 'desc' },
                    { totalReviews: 'desc' },
                    { id: 'asc' },
                ],
            });
        });

        it('calculates skip correctly for page 3', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mockMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(20);

            await getMedias(3, 10);

            expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
                where: {},
                skip: 20,
                take: 10,
                orderBy: [
                    { averageRating: 'desc' },
                    { totalReviews: 'desc' },
                    { id: 'asc' },
                ],
            });
        });

        it('uses default page size when not provided', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mockMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(20);

            await getMedias(1);

            expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
                where: {},
                skip: 0,
                take: 12,
                orderBy: [
                    { averageRating: 'desc' },
                    { totalReviews: 'desc' },
                    { id: 'asc' },
                ],
            });
        });

        it('uses default page number when not provided', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mockMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(20);

            await getMedias();

            expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
                where: {},
                skip: 0,
                take: 12,
                orderBy: [
                    { averageRating: 'desc' },
                    { totalReviews: 'desc' },
                    { id: 'asc' },
                ],
            });
        });
    });

    describe('Sorting', () => {
        it('orders by averageRating descending, then totalReviews descending, then id ascending', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mockMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(2);

            await getMedias(1, 12);

            expect(prisma.mediaItem.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: [
                        { averageRating: 'desc' },
                        { totalReviews: 'desc' },
                        { id: 'asc' },
                    ],
                })
            );
        });

        it('ensures stable pagination with id as tiebreaker', async () => {
            // This test verifies that items with identical ratings are ordered consistently by ID
            const itemsWithSameRating = [
                {
                    id: '1',
                    title: 'Item 1',
                    type: 'GAME',
                    year: 2023,
                    director: null,
                    author: null,
                    artist: null,
                    genre: [],
                    poster: null,
                    cover: null,
                    description: 'Test',
                    averageRating: 5.0,
                    totalReviews: 10,
                    totalLikes: 5,
                    totalDislikes: 1,
                    createdAt: new Date('2023-01-01'),
                    updatedAt: new Date('2023-01-01'),
                },
                {
                    id: '2',
                    title: 'Item 2',
                    type: 'GAME',
                    year: 2023,
                    director: null,
                    author: null,
                    artist: null,
                    genre: [],
                    poster: null,
                    cover: null,
                    description: 'Test',
                    averageRating: 5.0,
                    totalReviews: 10,
                    totalLikes: 5,
                    totalDislikes: 1,
                    createdAt: new Date('2023-01-02'),
                    updatedAt: new Date('2023-01-02'),
                },
                {
                    id: '3',
                    title: 'Item 3',
                    type: 'GAME',
                    year: 2023,
                    director: null,
                    author: null,
                    artist: null,
                    genre: [],
                    poster: null,
                    cover: null,
                    description: 'Test',
                    averageRating: 5.0,
                    totalReviews: 10,
                    totalLikes: 5,
                    totalDislikes: 1,
                    createdAt: new Date('2023-01-03'),
                    updatedAt: new Date('2023-01-03'),
                },
            ];

            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(itemsWithSameRating);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(3);

            await getMedias(1, 12, 'game');

            // Verify that the orderBy has the exact structure with id as the final tiebreaker
            expect(prisma.mediaItem.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: [
                        { averageRating: 'desc' },
                        { totalReviews: 'desc' },
                        { id: 'asc' },
                    ],
                })
            );
        });
    });

    describe('Data Transformation', () => {
        it('transforms Prisma data to SafeMediaItem format', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mockMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(2);

            const result = await getMedias(1, 12);

            expect(result.items[0]).toEqual({
                id: '1',
                title: 'Test Movie 1',
                type: 'film',
                year: 2023,
                director: 'Director 1',
                author: undefined,
                artist: undefined,
                genre: ['Action', 'Drama'],
                poster: 'poster1.jpg',
                cover: undefined,
                description: 'Test description 1',
                averageRating: 4.5,
                totalReviews: 10,
            });
        });

        it('converts MediaType enum to lowercase', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mockMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(2);

            const result = await getMedias(1, 12);

            expect(result.items[0].type).toBe('film');
            expect(result.items[1].type).toBe('film');
        });

        it('converts null values to undefined', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mockMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(2);

            const result = await getMedias(1, 12);

            expect(result.items[0].author).toBeUndefined();
            expect(result.items[0].artist).toBeUndefined();
            expect(result.items[0].cover).toBeUndefined();
        });

        it('returns both items and total count', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mockMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(25);

            const result = await getMedias(1, 12);

            expect(result).toHaveProperty('items');
            expect(result).toHaveProperty('total');
            expect(result.items).toHaveLength(2);
            expect(result.total).toBe(25);
        });
    });

    describe('Edge Cases', () => {
        it('handles empty result set', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue([]);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(0);

            const result = await getMedias(1, 12);

            expect(result.items).toEqual([]);
            expect(result.total).toBe(0);
        });

        it('handles page beyond available data', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue([]);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(10);

            const result = await getMedias(5, 12);

            expect(result.items).toEqual([]);
            expect(result.total).toBe(10);
        });

        it('handles custom page size', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mockMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(20);

            await getMedias(1, 6);

            expect(prisma.mediaItem.findMany).toHaveBeenCalledWith({
                where: {},
                skip: 0,
                take: 6,
                orderBy: [
                    { averageRating: 'desc' },
                    { totalReviews: 'desc' },
                    { id: 'asc' },
                ],
            });
        });
    });

    describe('Error Handling', () => {
        it('throws error when database query fails', async () => {
            const dbError = new Error('Database connection failed');
            (prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue(
                dbError
            );

            await expect(getMedias(1, 12)).rejects.toThrow(
                'Could not fetch media items.'
            );
        });

        it('logs error when database query fails', async () => {
            const loggerErrorSpy = vi.spyOn(logger, 'error');
            const dbError = new Error('Database connection failed');
            (prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue(
                dbError
            );

            try {
                await getMedias(1, 12);
            } catch {
                // Expected to throw
            }

            expect(loggerErrorSpy).toHaveBeenCalledWith(
                'GET /actions/media',
                expect.objectContaining({
                    method: 'getMedias',
                    error: dbError,
                })
            );

            loggerErrorSpy.mockRestore();
        });
    });

    describe('Transaction Usage', () => {
        it('uses Prisma transaction for atomic operation', async () => {
            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mockMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(20);

            await getMedias(1, 12);

            expect(prisma.$transaction).toHaveBeenCalledTimes(1);
            expect(prisma.$transaction).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.any(Promise),
                    expect.any(Promise),
                ])
            );
        });
    });

    describe('Different Media Types', () => {
        it('handles different media types correctly', async () => {
            const mixedMediaItems = [
                { ...mockMediaItems[0], type: 'FILM' },
                { ...mockMediaItems[1], type: 'SERIES' },
            ];

            (
                prisma.mediaItem.findMany as ReturnType<typeof vi.fn>
            ).mockResolvedValue(mixedMediaItems);
            (
                prisma.mediaItem.count as ReturnType<typeof vi.fn>
            ).mockResolvedValue(2);

            const result = await getMedias(1, 12);

            expect(result.items[0].type).toBe('film');
            expect(result.items[1].type).toBe('series');
        });
    });
});

describe('getMediaById Server Action', () => {
    const mockMediaItem = {
        id: '1',
        title: 'Test Movie',
        type: 'FILM',
        totalReviews: 15,
    };

    const mockReviews = Array.from({ length: 5 }, (_, i) => ({
        id: `review-${i}`,
        rating: 4,
        user: { id: `user-${i}`, name: `User ${i}` },
    }));

    beforeEach(() => {
        vi.clearAllMocks();
        (
            prisma.mediaItem.findUnique as ReturnType<typeof vi.fn>
        ).mockResolvedValue(mockMediaItem);
        (prisma.review.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockReviews
        );
    });

    it('fetches reviews for the first page', async () => {
        await getMediaById('1', 1, 5);
        expect(prisma.review.findMany).toHaveBeenCalledWith({
            where: { mediaId: '1' },
            include: { user: true },
            skip: 0,
            take: 5,
            orderBy: { createdAt: 'desc' },
        });
    });

    it('fetches reviews for a specific page', async () => {
        await getMediaById('1', 3, 5);
        expect(prisma.review.findMany).toHaveBeenCalledWith({
            where: { mediaId: '1' },
            include: { user: true },
            skip: 10,
            take: 5,
            orderBy: { createdAt: 'desc' },
        });
    });

    it('calculates totalPages correctly', async () => {
        const result = await getMediaById('1', 1, 5);
        expect(result?.totalPages).toBe(3);
    });

    it('handles default page and pageSize', async () => {
        await getMediaById('1');
        expect(prisma.review.findMany).toHaveBeenCalledWith({
            where: { mediaId: '1' },
            include: { user: true },
            skip: 0,
            take: 5,
            orderBy: { createdAt: 'desc' },
        });
    });

    it('returns the correct currentPage', async () => {
        const result = await getMediaById('1', 2, 5);
        expect(result?.currentPage).toBe(2);
    });
});

describe('getGlobalMediaStats Server Action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock redis.get to return null (cache miss) by default
        (redis.get as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        // Mock redis.setex to succeed
        (redis.setex as ReturnType<typeof vi.fn>).mockResolvedValue('OK');
    });

    it('returns the correct global media stats', async () => {
        (prisma.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue([
            { _max: { averageRating: 4.9 } },
            15,
        ]);

        const result = await getGlobalMediaStats();

        expect(result).toEqual({
            topRated: 4.9,
            recentlyAdded: 15,
        });
    });

    it('handles null averageRating gracefully', async () => {
        (prisma.$transaction as ReturnType<typeof vi.fn>).mockResolvedValue([
            { _max: { averageRating: null } },
            10,
        ]);

        const result = await getGlobalMediaStats();

        expect(result).toEqual({
            topRated: 0,
            recentlyAdded: 10,
        });
    });

    it('returns default values when database query fails', async () => {
        const dbError = new Error('Database connection failed');
        (prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue(
            dbError
        );

        await expect(getGlobalMediaStats()).rejects.toThrow(
            'Could not fetch global media stats.'
        );
    });

    it('logs error when database query fails', async () => {
        const loggerErrorSpy = vi.spyOn(logger, 'error');
        const dbError = new Error('Database connection failed');
        (prisma.$transaction as ReturnType<typeof vi.fn>).mockRejectedValue(
            dbError
        );

        try {
            await getGlobalMediaStats();
        } catch {
            // Expected to throw
        }

        expect(loggerErrorSpy).toHaveBeenCalledWith(
            'GET /actions/media',
            expect.objectContaining({
                method: 'getGlobalMediaStats',
                error: dbError,
            })
        );

        loggerErrorSpy.mockRestore();
    });
});

describe('getMediaMetadata Server Action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns title when media exists', async () => {
        const mockMedia = {
            title: 'Test Movie',
        };

        (
            prisma.mediaItem.findUnique as ReturnType<typeof vi.fn>
        ).mockResolvedValue(mockMedia);

        const result = await getMediaMetadata('media1');

        expect(result).toEqual({
            title: 'Test Movie',
        });
        expect(prisma.mediaItem.findUnique).toHaveBeenCalledWith({
            where: { id: 'media1' },
            select: {
                title: true,
            },
        });
    });

    it('returns null when media is not found', async () => {
        (
            prisma.mediaItem.findUnique as ReturnType<typeof vi.fn>
        ).mockResolvedValue(null);

        const result = await getMediaMetadata('non-existent-id');

        expect(result).toBeNull();
        expect(prisma.mediaItem.findUnique).toHaveBeenCalledWith({
            where: { id: 'non-existent-id' },
            select: {
                title: true,
            },
        });
    });

    it('logs error when database query fails', async () => {
        const loggerErrorSpy = vi.spyOn(logger, 'error');
        const dbError = new Error('Database connection failed');
        (
            prisma.mediaItem.findUnique as ReturnType<typeof vi.fn>
        ).mockRejectedValue(dbError);

        const result = await getMediaMetadata('media1');

        expect(result).toBeNull();
        expect(loggerErrorSpy).toHaveBeenCalledWith(
            'GET /actions/media',
            expect.objectContaining({
                method: 'getMediaMetadata',
                error: dbError,
                mediaId: 'media1',
            })
        );

        loggerErrorSpy.mockRestore();
    });

    it('only queries title field (performance optimization)', async () => {
        const mockMedia = {
            title: 'Test Game',
        };

        (
            prisma.mediaItem.findUnique as ReturnType<typeof vi.fn>
        ).mockResolvedValue(mockMedia);

        await getMediaMetadata('media3');

        const callArgs = (
            prisma.mediaItem.findUnique as ReturnType<typeof vi.fn>
        ).mock.calls[0][0];
        expect(callArgs.select).toEqual({
            title: true,
        });
        // Ensure no other fields are included
        expect(Object.keys(callArgs.select)).toHaveLength(1);
    });
});

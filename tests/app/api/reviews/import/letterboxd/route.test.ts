import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST } from '@/app/api/reviews/import/letterboxd/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { NextRequest } from 'next/server';
import { ApiErrorType } from '@/lib/errors';
import { logger } from '@/lib/axiom/server';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
    prisma: {
        mediaItem: {
            findFirst: vi.fn(),
            create: vi.fn(),
        },
        review: {
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
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

describe('POST /api/reviews/import/letterboxd', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('fetch', vi.fn());
    });

    const mockRequest = (body: unknown) => {
        return {
            json: async () => body,
            headers: new Headers({ 'Content-Type': 'application/json' }),
        } as unknown as NextRequest;
    };

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);
        const req = mockRequest({});
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
    });

    it('should return 400 Validation Error if Name or Year is missing', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: 'user-1' } });
        const req = mockRequest({ Name: 'Dune', Rating: '4' });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.code).toBe(ApiErrorType.VALIDATION_ERROR);
        expect(data.error).toBe('Name and Year are required to import a review from Letterboxd.');
    });

    it('should return 400 Validation Error if Year is invalid', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: 'user-1' } });
        const req = mockRequest({ Name: 'Dune', Year: 'abcd' });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.code).toBe(ApiErrorType.VALIDATION_ERROR);
        expect(data.error).toBe('Invalid year format');
    });

    it('should import a review successfully for an existing MediaItem', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: 'user-1' } });
        (prisma.mediaItem.findFirst as Mock).mockResolvedValue({ id: 'media-1', title: 'Dune' });
        (prisma.review.findFirst as Mock).mockResolvedValue(null);
        (prisma.review.create as Mock).mockResolvedValue({ id: 'review-1' });

        const req = mockRequest({
            Name: 'Dune',
            Year: '2021',
            Rating: '4.5',
            Rewatch: 'No',
            Review: 'Great movie!',
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.message).toBe('Review imported successfully');
        expect(prisma.review.create).toHaveBeenCalledWith({
            data: {
                rating: 4.5,
                review: 'Great movie!',
                consumedMoreThanOnce: false,
                mediaId: 'media-1',
                userId: 'user-1',
            }
        });
    });

    it('should fetch TMDB and create a new MediaItem if not found', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: 'user-1' } });
        (prisma.mediaItem.findFirst as Mock).mockResolvedValue(null);

        (global.fetch as Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                results: [
                    {
                        title: 'Dune',
                        release_date: '2021-09-15',
                        poster_path: '/poster.jpg',
                        overview: 'A desert planet...',
                        genre_ids: [28, 12, 878], // Assuming 878 is Sci-Fi
                    }
                ]
            })
        });

        (prisma.mediaItem.create as Mock).mockResolvedValue({ id: 'new-media-1', title: 'Dune' });
        (prisma.review.findFirst as Mock).mockResolvedValue(null);
        (prisma.review.create as Mock).mockResolvedValue({ id: 'review-1' });

        const req = mockRequest({
            Name: 'Dune',
            Year: '2021',
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(prisma.mediaItem.create).toHaveBeenCalled();
        expect(prisma.review.create).toHaveBeenCalled();
    });

    it('should update existing review if rewatch flag is present', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: 'user-1' } });
        (prisma.mediaItem.findFirst as Mock).mockResolvedValue({ id: 'media-1', title: 'Dune' });
        (prisma.review.findFirst as Mock).mockResolvedValue({ id: 'review-1', consumedMoreThanOnce: false });
        (prisma.review.update as Mock).mockResolvedValue({ id: 'review-1' });

        const req = mockRequest({
            Name: 'Dune',
            Year: '2021',
            Rewatch: 'Yes',
        });

        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.alreadyExisted).toBe(true);
        expect(prisma.review.update).toHaveBeenCalledWith({
            where: { id: 'review-1' },
            data: {
                consumedMoreThanOnce: true,
            }
        });
    });
});

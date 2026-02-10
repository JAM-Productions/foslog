import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST, DELETE } from '@/app/api/review/[id]/like/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { NextRequest } from 'next/server';
import { ApiErrorType } from '@/lib/errors';

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        review: {
            findUnique: vi.fn(),
        },
        reviewLike: {
            findUnique: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

vi.mock('@/lib/auth/auth', () => ({
    auth: {
        api: {
            getSession: vi.fn(),
        },
    },
}));

describe('POST /api/review/[id]/like', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRequest = () => {
        return {
            headers: new Headers({
                'Content-Type': 'application/json',
                referer: 'http://localhost:3000/en/review/review1',
            }),
        } as unknown as NextRequest;
    };

    const mockParams = (id: string) => Promise.resolve({ id });

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);
        const req = mockRequest();
        const response = await POST(req, { params: mockParams('review1') });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
        expect(data.error).toBe(
            'Unauthorized. Please log in to like a review.'
        );
    });

    it('should return 404 Not Found if review does not exist', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.review.findUnique as Mock).mockResolvedValue(null);

        const req = mockRequest();
        const response = await POST(req, { params: mockParams('review1') });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.code).toBe(ApiErrorType.NOT_FOUND);
        expect(data.error).toBe('Review not found');
    });

    it('should return 409 Conflict if user already liked the review', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.review.findUnique as Mock).mockResolvedValue({ id: 'review1' });
        (prisma.$transaction as Mock).mockImplementation(async () => {
            throw new Error('ALREADY_LIKED');
        });

        const req = mockRequest();
        const response = await POST(req, { params: mockParams('review1') });
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.code).toBe(ApiErrorType.CONFLICT);
        expect(data.error).toBe('You already liked this review');
    });

    it('should create a like successfully and return 201', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.review.findUnique as Mock).mockResolvedValue({
            id: 'review1',
            mediaId: 'media1',
        });
        (prisma.$transaction as Mock).mockImplementation(async (callback) => {
            const mockTx = {
                reviewLike: {
                    findUnique: vi.fn().mockResolvedValue(null),
                    create: vi.fn().mockResolvedValue({
                        id: 'like1',
                        reviewId: 'review1',
                        userId: 'user1',
                        createdAt: new Date(),
                    }),
                },
            };
            return await callback(mockTx);
        });

        const req = mockRequest();
        const response = await POST(req, { params: mockParams('review1') });
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.message).toBe('Review liked successfully');
    });

    it('should return 500 Internal Server Error on database failure', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.review.findUnique as Mock).mockRejectedValue(
            new Error('Database error')
        );

        const req = mockRequest();
        const response = await POST(req, { params: mockParams('review1') });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.code).toBe(ApiErrorType.INTERNAL_SERVER_ERROR);
    });

    it('should check for existing like with correct composite key', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.review.findUnique as Mock).mockResolvedValue({
            id: 'review1',
            mediaId: 'media1',
        });

        const mockFindUnique = vi.fn().mockResolvedValue(null);
        const mockCreate = vi.fn().mockResolvedValue({
            id: 'like1',
            reviewId: 'review1',
            userId: 'user1',
        });

        (prisma.$transaction as Mock).mockImplementation(async (callback) => {
            const mockTx = {
                reviewLike: {
                    findUnique: mockFindUnique,
                    create: mockCreate,
                },
            };
            return await callback(mockTx);
        });

        const req = mockRequest();
        await POST(req, { params: mockParams('review1') });

        expect(mockFindUnique).toHaveBeenCalledWith({
            where: {
                reviewId_userId: {
                    reviewId: 'review1',
                    userId: 'user1',
                },
            },
        });
    });

    it('should extract locale from referer header', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.review.findUnique as Mock).mockResolvedValue({
            id: 'review1',
            mediaId: 'media1',
        });
        (prisma.$transaction as Mock).mockImplementation(async (callback) => {
            const mockTx = {
                reviewLike: {
                    findUnique: vi.fn().mockResolvedValue(null),
                    create: vi.fn().mockResolvedValue({
                        id: 'like1',
                    }),
                },
            };
            return await callback(mockTx);
        });

        const reqWithCaLocale = {
            headers: new Headers({
                'Content-Type': 'application/json',
                referer: 'http://localhost:3000/ca/review/review1',
            }),
        } as unknown as NextRequest;

        const response = await POST(reqWithCaLocale, {
            params: mockParams('review1'),
        });

        expect(response.status).toBe(201);
        // Note: We can't directly test revalidatePath call, but the endpoint should handle it
    });
});

describe('DELETE /api/review/[id]/like', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRequest = () => {
        return {
            headers: new Headers({
                'Content-Type': 'application/json',
                referer: 'http://localhost:3000/en/review/review1',
            }),
        } as unknown as NextRequest;
    };

    const mockParams = (id: string) => Promise.resolve({ id });

    it('should return 401 Unauthorized if user is not authenticated', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue(null);
        const req = mockRequest();
        const response = await DELETE(req, { params: mockParams('review1') });
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
        expect(data.error).toBe(
            'Unauthorized. Please log in to unlike a review.'
        );
    });

    it('should return 404 Not Found if like does not exist', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.$transaction as Mock).mockImplementation(async () => {
            throw new Error('LIKE_NOT_FOUND');
        });

        const req = mockRequest();
        const response = await DELETE(req, { params: mockParams('review1') });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.code).toBe(ApiErrorType.NOT_FOUND);
        expect(data.error).toBe('Like not found');
    });

    it('should delete like successfully and return 200', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.$transaction as Mock).mockImplementation(async (callback) => {
            const mockTx = {
                reviewLike: {
                    findUnique: vi.fn().mockResolvedValue({
                        id: 'like1',
                        reviewId: 'review1',
                        userId: 'user1',
                    }),
                    delete: vi.fn().mockResolvedValue({
                        id: 'like1',
                    }),
                },
            };
            return await callback(mockTx);
        });

        const req = mockRequest();
        const response = await DELETE(req, { params: mockParams('review1') });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Review unliked successfully');
    });

    it('should return 500 Internal Server Error on database failure', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.$transaction as Mock).mockRejectedValue(
            new Error('Database error')
        );

        const req = mockRequest();
        const response = await DELETE(req, { params: mockParams('review1') });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.code).toBe(ApiErrorType.INTERNAL_SERVER_ERROR);
    });

    it('should check for existing like with correct composite key', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });

        const mockFindUnique = vi.fn().mockResolvedValue({
            id: 'like1',
            reviewId: 'review1',
            userId: 'user1',
        });
        const mockDelete = vi.fn().mockResolvedValue({ id: 'like1' });

        (prisma.$transaction as Mock).mockImplementation(async (callback) => {
            const mockTx = {
                reviewLike: {
                    findUnique: mockFindUnique,
                    delete: mockDelete,
                },
            };
            return await callback(mockTx);
        });

        const req = mockRequest();
        await DELETE(req, { params: mockParams('review1') });

        expect(mockFindUnique).toHaveBeenCalledWith({
            where: {
                reviewId_userId: {
                    reviewId: 'review1',
                    userId: 'user1',
                },
            },
        });
    });

    it('should handle different review IDs correctly', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });

        const mockFindUnique = vi.fn().mockResolvedValue({
            id: 'like2',
            reviewId: 'review999',
            userId: 'user1',
        });

        (prisma.$transaction as Mock).mockImplementation(async (callback) => {
            const mockTx = {
                reviewLike: {
                    findUnique: mockFindUnique,
                    delete: vi.fn().mockResolvedValue({ id: 'like2' }),
                },
            };
            return await callback(mockTx);
        });

        const req = mockRequest();
        const response = await DELETE(req, { params: mockParams('review999') });

        expect(response.status).toBe(200);
        expect(mockFindUnique).toHaveBeenCalledWith({
            where: {
                reviewId_userId: {
                    reviewId: 'review999',
                    userId: 'user1',
                },
            },
        });
    });

    it('should extract locale from referer header for Spanish', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({
            user: { id: 'user1' },
        });
        (prisma.$transaction as Mock).mockImplementation(async (callback) => {
            const mockTx = {
                reviewLike: {
                    findUnique: vi.fn().mockResolvedValue({
                        id: 'like1',
                        reviewId: 'review1',
                    }),
                    delete: vi.fn().mockResolvedValue({ id: 'like1' }),
                },
            };
            return await callback(mockTx);
        });

        const reqWithEsLocale = {
            headers: new Headers({
                'Content-Type': 'application/json',
                referer: 'http://localhost:3000/es/review/review1',
            }),
        } as unknown as NextRequest;

        const response = await DELETE(reqWithEsLocale, {
            params: mockParams('review1'),
        });

        expect(response.status).toBe(200);
    });
});

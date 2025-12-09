import { PATCH, DELETE } from '@/app/api/review/[id]/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth/auth');
vi.mock('@/lib/prisma', () => ({
    prisma: {
        review: {
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            aggregate: vi.fn(),
            count: vi.fn(),
        },
        mediaItem: {
            update: vi.fn(),
        },
        $transaction: vi.fn().mockImplementation(async (fn) => fn(prisma)),
    },
}));
vi.mock('next/cache');

describe('PATCH /api/review/[id]', () => {
    const mockSession = { user: { id: 'user-1' } };
    const mockReview = {
        id: 'review-1',
        userId: 'user-1',
        mediaId: 'media-1',
        rating: 3,
        review: 'Old review',
    };
    const mockRequest = (body: any) =>
        ({
            headers: new Headers(),
            json: async () => body,
        } as unknown as NextRequest);
    const mockParams = { params: { id: 'review-1' } };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should update a review successfully', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
        vi.mocked(prisma.review.findUnique).mockResolvedValue(mockReview as any);
        const updatedReview = {
            ...mockReview,
            rating: 5,
            review: 'New review',
        };
        vi.mocked(prisma.review.update).mockResolvedValue(updatedReview as any);
        vi.mocked(prisma.review.aggregate).mockResolvedValue({
            _avg: { rating: 4.5 },
        } as any);
        vi.mocked(prisma.review.count).mockResolvedValue(10 as any);

        const newReviewData = {
            review: { stars: 5, text: 'New review', liked: null },
        };
        const request = mockRequest(newReviewData);

        const response = await PATCH(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Review updated successfully');
        expect(data.review).toEqual(updatedReview);
        expect(prisma.$transaction).toHaveBeenCalled();
        expect(revalidatePath).toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(null);

        const request = mockRequest({ review: {} });
        const response = await PATCH(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe(
            'Unauthorized. Please log in to update a review.'
        );
    });

    it('should return 403 if user is not the owner of the review', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: 'user-2' },
        } as any);
        vi.mocked(prisma.review.findUnique).mockResolvedValue(mockReview as any);

        const request = mockRequest({ review: { stars: 5 } });
        const response = await PATCH(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('You are not authorized to update this review');
    });

    it('should return 404 if review not found', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
        vi.mocked(prisma.review.findUnique).mockResolvedValue(null);

        const request = mockRequest({ review: { stars: 5 } });
        const response = await PATCH(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Review not found');
    });

    it('should return 422 for validation errors', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

        const request = mockRequest({ review: { stars: 6 } });
        const response = await PATCH(request, mockParams);
        const data = await response.json();

        expect(response.status).toBe(422);
        expect(data.error).toBe('Rating must be between 1 and 5');
    });
});

describe('DELETE /api/review/[id]', () => {
    const mockSession = { user: { id: 'user-1' } };
    const mockReview = {
        id: 'review-1',
        userId: 'user-1',
        mediaId: 'media-1',
    };
    const mockRequest = {
        headers: new Headers(),
    } as unknown as NextRequest;
    const mockParams = { params: { id: 'review-1' } };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should delete a review successfully', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
        vi.mocked(prisma.review.findUnique).mockResolvedValue(mockReview as any);
        vi.mocked(prisma.review.delete).mockResolvedValue(mockReview as any);
        vi.mocked(prisma.review.aggregate).mockResolvedValue({
            _avg: { rating: 4.5 },
        } as any);
        vi.mocked(prisma.review.count).mockResolvedValue(9 as any);

        const response = await DELETE(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.message).toBe('Review deleted successfully');
        expect(prisma.$transaction).toHaveBeenCalled();
        expect(revalidatePath).toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(null);

        const response = await DELETE(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.error).toBe(
            'Unauthorized. Please log in to delete a review.'
        );
    });

    it('should return 403 if user is not the owner of the review', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue({
            user: { id: 'user-2' },
        } as any);
        vi.mocked(prisma.review.findUnique).mockResolvedValue(mockReview as any);

        const response = await DELETE(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('You are not authorized to delete this review');
    });

    it('should return 404 if review not found', async () => {
        vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);
        vi.mocked(prisma.review.findUnique).mockResolvedValue(null);

        const response = await DELETE(mockRequest, mockParams);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Review not found');
    });
});

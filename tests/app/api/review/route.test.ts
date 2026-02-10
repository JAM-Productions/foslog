import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST } from '@/app/api/review/route';
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
    $transaction: vi.fn(),
    mediaItem: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    review: {
      create: vi.fn(),
      aggregate: vi.fn(),
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

describe('POST /api/review', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('should return 400 Validation Error for missing review object', async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
    const req = mockRequest({ mediaId: '1' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe(ApiErrorType.VALIDATION_ERROR);
    expect(data.error).toBe('Review object is required');
  });

  it('should return 400 Validation Error for invalid rating', async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
    const req = mockRequest({ review: { stars: 6 }, mediaId: '1' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe(ApiErrorType.VALIDATION_ERROR);
    expect(data.error).toBe('Rating must be between 0.5 and 5 in 0.5 increments');
  });

  it('should accept 0.5 as a valid rating', async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.mediaItem.findUnique as Mock).mockResolvedValue({ id: '1' });
    (prisma.review.create as Mock).mockResolvedValue({ id: 'rev1' });

    const req = mockRequest({ review: { stars: 0.5 }, mediaId: '1' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('Review created successfully');
    expect(prisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          rating: 0.5,
        }),
      })
    );
  });

  it('should return 400 Validation Error for long review text', async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
    const req = mockRequest({ review: { stars: 5, text: 'a'.repeat(5001) }, mediaId: '1' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe(ApiErrorType.VALIDATION_ERROR);
    expect(data.error).toBe('Review text is too long');
  });

  it('should return 400 Validation Error for missing media ID', async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
    const req = mockRequest({ review: { stars: 5 } });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe(ApiErrorType.VALIDATION_ERROR);
    expect(data.error).toBe('Media ID is required');
  });

  it('should return 404 Not Found if media item does not exist', async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.mediaItem.findUnique as Mock).mockResolvedValue(null);
    const req = mockRequest({ review: { stars: 5 }, mediaId: '1' });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Media item not found');
  });

  it('should return 500 Internal Server Error on database failure', async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.mediaItem.findUnique as Mock).mockRejectedValue(new Error('DB error'));
    const req = mockRequest({ review: { stars: 5 }, mediaId: '1' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.code).toBe(ApiErrorType.INTERNAL_SERVER_ERROR);
  });

  it('should create a review successfully', async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.mediaItem.findUnique as Mock).mockResolvedValue({ id: '1' });
    (prisma.review.create as Mock).mockResolvedValue({ id: 'rev1' });

    const req = mockRequest({ review: { stars: 5 }, mediaId: '1' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('Review created successfully');
    expect(prisma.review.create).toHaveBeenCalled();
  });
});

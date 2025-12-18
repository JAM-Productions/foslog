import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST, PATCH, DELETE } from '@/app/api/review/route';
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
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
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
    expect(data.error).toBe('Rating must be between 1 and 5');
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
    (prisma.$transaction as Mock).mockImplementation(async (callback) => {
      const tx = {
        mediaItem: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
      };
      return callback(tx);
    });
    const req = mockRequest({ review: { stars: 5 }, mediaId: '1' });

    // As the error is thrown inside the transaction, we need to catch it.
    // The route handler catches it and returns a notFound response.
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.code).toBe(ApiErrorType.NOT_FOUND);
  });

  it('should return 500 Internal Server Error on database failure', async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.$transaction as Mock).mockRejectedValue(new Error('DB error'));
    const req = mockRequest({ review: { stars: 5 }, mediaId: '1' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.code).toBe(ApiErrorType.INTERNAL_SERVER_ERROR);
  });

  it('should create a review successfully', async () => {
    (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.$transaction as Mock).mockImplementation(async (callback) => {
      const tx = {
        mediaItem: {
          findUnique: vi.fn().mockResolvedValue({ id: '1' }),
          update: vi.fn(),
        },
        review: {
          create: vi.fn().mockResolvedValue({ id: 'rev1' }),
          aggregate: vi.fn().mockResolvedValue({ _avg: { rating: 4.5 }, _count: 10 }),
          count: vi.fn().mockResolvedValue(5),
        },
      };
      return callback(tx);
    });

    const req = mockRequest({ review: { stars: 5 }, mediaId: '1' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toBe('Review created successfully');
  });
});

describe('PATCH /api/review', () => {
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
        const response = await PATCH(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
    });

    it('should return 400 Validation Error for missing review ID', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
        const req = mockRequest({ review: { stars: 5 } });
        const response = await PATCH(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.code).toBe(ApiErrorType.VALIDATION_ERROR);
        expect(data.error).toBe('Review ID is required');
    });

    it('should return 404 Not Found if review does not exist', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
        (prisma.$transaction as Mock).mockImplementation(async (callback) => {
            const tx = {
                review: {
                    findUnique: vi.fn().mockResolvedValue(null),
                },
            };
            return callback(tx);
        });
        const req = mockRequest({ review: { stars: 5 }, reviewId: '1' });
        const response = await PATCH(req);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.code).toBe(ApiErrorType.NOT_FOUND);
    });

    it('should return 401 Unauthorized if user is not the author', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '2' } });
        (prisma.$transaction as Mock).mockImplementation(async (callback) => {
            const tx = {
                review: {
                    findUnique: vi.fn().mockResolvedValue({ id: '1', userId: '1' }),
                },
            };
            return callback(tx);
        });
        const req = mockRequest({ review: { stars: 5 }, reviewId: '1' });
        const response = await PATCH(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
    });
});

describe('DELETE /api/review', () => {
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
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
    });

    it('should return 400 Validation Error for missing review ID', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
        const req = mockRequest({});
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.code).toBe(ApiErrorType.VALIDATION_ERROR);
        expect(data.error).toBe('Review ID is required');
    });

    it('should return 404 Not Found if review does not exist', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '1' } });
        (prisma.$transaction as Mock).mockImplementation(async (callback) => {
            const tx = {
                review: {
                    findUnique: vi.fn().mockResolvedValue(null),
                },
            };
            return callback(tx);
        });
        const req = mockRequest({ reviewId: '1' });
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.code).toBe(ApiErrorType.NOT_FOUND);
    });

    it('should return 401 Unauthorized if user is not the author', async () => {
        (auth.api.getSession as unknown as Mock).mockResolvedValue({ user: { id: '2' } });
        (prisma.$transaction as Mock).mockImplementation(async (callback) => {
            const tx = {
                review: {
                    findUnique: vi.fn().mockResolvedValue({ id: '1', userId: '1' }),
                },
            };
            return callback(tx);
        });
        const req = mockRequest({ reviewId: '1' });
        const response = await DELETE(req);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.code).toBe(ApiErrorType.UNAUTHORIZED);
    });
});

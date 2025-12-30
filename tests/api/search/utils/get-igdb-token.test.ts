import { vi, describe, it, expect, beforeEach } from 'vitest';

// 1. Create shared mock functions
const mockFindUnique = vi.fn();
const mockUpsert = vi.fn();

// 2. Use vi.doMock and inject the shared mocks
vi.doMock('@/lib/prisma', () => ({
  prisma: {
    apiToken: {
      findUnique: mockFindUnique,
      upsert: mockUpsert,
    },
    $transaction: vi.fn().mockImplementation(async (callback) => {
      // The transaction callback receives a client with the same mocks
      await callback({
        apiToken: {
          findUnique: mockFindUnique,
          upsert: mockUpsert,
        },
      });
    }),
  },
}));

// 3. Dynamically import the modules after mocking
const { getIgdbToken } = await import('@/app/api/search/utils/get-igdb-token');

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('getIgdbToken', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should only fetch a new token once when called concurrently with no existing token', async () => {
    // Arrange: No token in the database
    mockFindUnique.mockResolvedValue(null);

    const newTokenData = {
      access_token: 'new-test-token',
      expires_in: 3600,
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => newTokenData,
    });

    // Act: Call the function concurrently
    const concurrentPromises = [
      getIgdbToken(),
      getIgdbToken(),
      getIgdbToken(),
      getIgdbToken(),
      getIgdbToken(),
    ];

    const results = await Promise.all(concurrentPromises);

    // Assert: The test will now fail here, because the race condition causes multiple fetches and upserts.
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    results.forEach((token) => expect(token).toBe(newTokenData.access_token));
  });

  it('should only fetch a new token once when called concurrently with an expired token', async () => {
    // Arrange: Expired token in the database
    const expiredToken = {
      token: 'expired-token',
      expiresAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    };
    mockFindUnique.mockResolvedValue(expiredToken);

    const newTokenData = {
      access_token: 'new-test-token-2',
      expires_in: 3600,
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => newTokenData,
    });

    // Act: Call the function concurrently
    const concurrentPromises = [
      getIgdbToken(),
      getIgdbToken(),
      getIgdbToken(),
    ];

    const results = await Promise.all(concurrentPromises);

    // Assert: The test will also fail here.
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    results.forEach((token) => expect(token).toBe(newTokenData.access_token));
  });

  it('should return the existing token if it is not expired', async () => {
    // Arrange: Valid token in the database
    const validToken = {
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // Expires in 1 hour
    };
    mockFindUnique.mockResolvedValue(validToken);

    // Act
    const token = await getIgdbToken();

    // Assert
    expect(token).toBe('valid-token');
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});

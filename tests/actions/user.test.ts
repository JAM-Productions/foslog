import {
    getUserProfile,
    getUserReviews,
    getUserStats,
    isFollowedByCurrentUser,
    hasUserReviewed,
    hasUserBookmarked,
    getUserMediaLists,
    getUserMediaListData,
    getUserListMetadata,
} from '@/app/actions/user';
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
        follow: {
            findUnique: vi.fn(),
        },
        list: {
            findFirst: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
        },
        listMediaItem: {
            findUnique: vi.fn(),
        },
    },
}));

// Mock auth
vi.mock('@/lib/auth/auth', () => ({
    auth: {
        api: {
            getSession: vi.fn(),
        },
    },
}));

// Mock next/headers
vi.mock('next/headers', () => ({
    headers: vi.fn(),
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
                totalFollowers: 10,
                totalFollowing: 5,
            };

            vi.mocked(prisma.user.findUnique).mockResolvedValue(
                mockUser as any
            );

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
                totalFollowers: 10,
                totalFollowing: 5,
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
                    totalComments: 0,
                    totalLikes: 10,
                    user: {
                        id: 'user1',
                        name: 'Test User',
                        createdAt: new Date(),
                        totalFollowers: 10,
                        totalFollowing: 5,
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

            vi.mocked(prisma.review.findMany).mockResolvedValue(
                mockReviews as any
            );
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

            vi.mocked(prisma.review.findMany).mockResolvedValue(
                mockReviews as any
            );

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

    describe('isFollowedByCurrentUser', () => {
        test('should return false when user is not authenticated', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue(null);

            const result = await isFollowedByCurrentUser('targetUser');

            expect(result).toBe(false);
            expect(auth.api.getSession).toHaveBeenCalled();
        });

        test('should return true when user is following the target user', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'currentUser' },
                session: {},
            } as any);

            const mockFollow = {
                id: 'follow1',
                followerId: 'currentUser',
                followingId: 'targetUser',
                createdAt: new Date(),
            };

            vi.mocked(prisma.follow.findUnique).mockResolvedValue(
                mockFollow as any
            );

            const result = await isFollowedByCurrentUser('targetUser');

            expect(result).toBe(true);
            expect(prisma.follow.findUnique).toHaveBeenCalledWith({
                where: {
                    followerId_followingId: {
                        followerId: 'currentUser',
                        followingId: 'targetUser',
                    },
                },
            });
        });

        test('should return false when user is not following the target user', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'currentUser' },
                session: {},
            } as any);

            vi.mocked(prisma.follow.findUnique).mockResolvedValue(null);

            const result = await isFollowedByCurrentUser('targetUser');

            expect(result).toBe(false);
            expect(prisma.follow.findUnique).toHaveBeenCalledWith({
                where: {
                    followerId_followingId: {
                        followerId: 'currentUser',
                        followingId: 'targetUser',
                    },
                },
            });
        });

        test('should throw error when database query fails', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'currentUser' },
                session: {},
            } as any);

            vi.mocked(prisma.follow.findUnique).mockRejectedValue(
                new Error('Database error')
            );

            await expect(isFollowedByCurrentUser('targetUser')).rejects.toThrow(
                'Could not determine follow status.'
            );
        });
    });

    describe('hasUserReviewed', () => {
        test('should return true when user has reviewed media', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.review.count).mockResolvedValue(1);

            const result = await hasUserReviewed('media1');

            expect(result).toBe(true);
            expect(prisma.review.count).toHaveBeenCalledWith({
                where: { mediaId: 'media1', userId: 'user1' },
            });
        });

        test('should return false when user has not reviewed media', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.review.count).mockResolvedValue(0);

            const result = await hasUserReviewed('media1');

            expect(result).toBe(false);
        });

        test('should return false when user is not authenticated', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue(null);

            const result = await hasUserReviewed('media1');

            expect(result).toBe(false);
            expect(prisma.review.count).not.toHaveBeenCalled();
        });

        test('should use provided userId if available', async () => {
            vi.mocked(prisma.review.count).mockResolvedValue(1);

            const result = await hasUserReviewed('media1', 'user2');

            expect(result).toBe(true);
            expect(prisma.review.count).toHaveBeenCalledWith({
                where: { mediaId: 'media1', userId: 'user2' },
            });
        });

        test('should throw error when database query fails', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.review.count).mockRejectedValue(
                new Error('Database error')
            );

            await expect(hasUserReviewed('media1')).rejects.toThrow(
                'Could not determine review status.'
            );
        });
    });

    describe('hasUserBookmarked', () => {
        test('should return true when user has bookmarked media', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            const mockList = { id: 'list1', userId: 'user1', type: 'BOOKMARK' };
            const mockBookmark = {
                id: 'item1',
                listId: 'list1',
                mediaId: 'media1',
            };

            vi.mocked(prisma.list.findFirst).mockResolvedValue(mockList as any);
            vi.mocked(prisma.listMediaItem.findUnique).mockResolvedValue(
                mockBookmark as any
            );

            const result = await hasUserBookmarked('media1');

            expect(result).toBe(true);
            expect(prisma.list.findFirst).toHaveBeenCalledWith({
                where: { userId: 'user1', type: 'BOOKMARK' },
            });
            expect(prisma.listMediaItem.findUnique).toHaveBeenCalledWith({
                where: {
                    listId_mediaId: { listId: 'list1', mediaId: 'media1' },
                },
            });
        });

        test('should return false when user has not bookmarked media', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            const mockList = { id: 'list1', userId: 'user1', type: 'BOOKMARK' };

            vi.mocked(prisma.list.findFirst).mockResolvedValue(mockList as any);
            vi.mocked(prisma.listMediaItem.findUnique).mockResolvedValue(null);

            const result = await hasUserBookmarked('media1');

            expect(result).toBe(false);
        });

        test('should return false when bookmark list does not exist', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findFirst).mockResolvedValue(null);

            const result = await hasUserBookmarked('media1');

            expect(result).toBe(false);
            expect(prisma.listMediaItem.findUnique).not.toHaveBeenCalled();
        });

        test('should return false when user is not authenticated', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue(null);

            const result = await hasUserBookmarked('media1');

            expect(result).toBe(false);
        });

        test('should use provided userId if available', async () => {
            const mockList = { id: 'list1', userId: 'user2', type: 'BOOKMARK' };
            const mockBookmark = {
                id: 'item1',
                listId: 'list1',
                mediaId: 'media1',
            };

            vi.mocked(prisma.list.findFirst).mockResolvedValue(mockList as any);
            vi.mocked(prisma.listMediaItem.findUnique).mockResolvedValue(
                mockBookmark as any
            );

            const result = await hasUserBookmarked('media1', 'user2');

            expect(result).toBe(true);
            expect(prisma.list.findFirst).toHaveBeenCalledWith({
                where: { userId: 'user2', type: 'BOOKMARK' },
            });
        });

        test('should throw error when database query fails', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findFirst).mockRejectedValue(
                new Error('Database error')
            );

            await expect(hasUserBookmarked('media1')).rejects.toThrow(
                'Could not determine bookmark status.'
            );
        });
    });

    describe('getUserMediaLists', () => {
        test('should return user lists when user is viewing their own profile', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            const mockLists = [
                {
                    id: 'list1',
                    name: 'My Favorites',
                    image: 'image1.jpg',
                    type: 'LIST',
                    mediaItems: [],
                },
                {
                    id: 'list2',
                    name: 'To Watch',
                    image: 'image2.jpg',
                    type: 'LIST',
                    mediaItems: [],
                },
            ];

            vi.mocked(prisma.list.findMany).mockResolvedValue(mockLists as any);

            const result = await getUserMediaLists('user1');

            expect(prisma.list.findMany).toHaveBeenCalledWith({
                where: { userId: 'user1' },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    type: true,
                },
            });
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: 'list1',
                name: 'My Favorites',
                image: 'image1.jpg',
                type: 'LIST',
            });
        });

        test('should return only public lists when viewing other users profile', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'currentUser' },
                session: {},
            } as any);

            const mockLists = [
                {
                    id: 'list1',
                    name: 'Recommendations',
                    image: 'image1.jpg',
                    type: 'LIST',
                    mediaItems: [],
                },
            ];

            vi.mocked(prisma.list.findMany).mockResolvedValue(mockLists as any);

            const result = await getUserMediaLists('otherUser');

            expect(prisma.list.findMany).toHaveBeenCalledWith({
                where: { userId: 'otherUser', type: 'LIST' },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    type: true,
                },
            });
            expect(result).toHaveLength(1);
        });

        test('should return empty array when user has no lists', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findMany).mockResolvedValue([]);

            const result = await getUserMediaLists('user1');

            expect(result).toEqual([]);
        });

        test('should throw error when database query fails', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findMany).mockRejectedValue(
                new Error('Database error')
            );

            await expect(getUserMediaLists('user1')).rejects.toThrow(
                'Could not fetch user media lists.'
            );
        });
    });

    describe('getUserMediaListData', () => {
        test('should return list data with media items', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            const mockList = {
                id: 'list1',
                name: 'My Favorites',
                image: 'image.jpg',
                type: 'LIST',
                user: { id: 'user1', name: 'Test User', image: 'user.jpg' },
                mediaItems: [
                    {
                        id: 'item1',
                        mediaId: 'media1',
                        createdAt: new Date(),
                        media: {
                            id: 'media1',
                            title: 'Movie 1',
                            type: 'FILM',
                            year: 2023,
                            poster: 'poster1.jpg',
                        },
                    },
                ],
            };

            vi.mocked(prisma.list.findFirst).mockResolvedValue(mockList as any);

            const result = await getUserMediaListData('user1', 'list1');

            expect(prisma.list.findFirst).toHaveBeenCalledWith({
                where: { id: 'list1', userId: 'user1' },
                include: {
                    user: true,
                    mediaItems: {
                        include: { media: true },
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
            expect(result?.id).toBe('list1');
            expect(result?.mediaItems).toHaveLength(1);
            expect(result?.mediaItems[0].media.title).toBe('Movie 1');
        });

        test('should return null when list not found', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findFirst).mockResolvedValue(null);

            const result = await getUserMediaListData('user1', 'nonexistent');

            expect(result).toBeNull();
        });

        test('should handle undefined values in media', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            const mockList = {
                id: 'list1',
                name: 'My List',
                image: null,
                type: 'LIST',
                user: { id: 'user1', name: null, image: null },
                mediaItems: [
                    {
                        id: 'item1',
                        mediaId: 'media1',
                        createdAt: new Date(),
                        media: {
                            id: 'media1',
                            title: 'Movie',
                            type: 'FILM',
                            year: null,
                            poster: null,
                        },
                    },
                ],
            };

            vi.mocked(prisma.list.findFirst).mockResolvedValue(mockList as any);

            const result = await getUserMediaListData('user1', 'list1');

            expect(result?.image).toBeUndefined();
            expect(result?.user.name).toBe('Unknown User');
            expect(result?.mediaItems[0].media.year).toBeUndefined();
        });

        test('should throw error when database query fails', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findFirst).mockRejectedValue(
                new Error('Database error')
            );

            await expect(
                getUserMediaListData('user1', 'list1')
            ).rejects.toThrow('Could not fetch user media list data.');
        });
    });

    describe('getUserListMetadata', () => {
        test('should return list metadata', async () => {
            const mockList = {
                id: 'list1',
                name: 'My Favorites',
                user: { name: 'Test User' },
            };

            vi.mocked(prisma.list.findUnique).mockResolvedValue(
                mockList as any
            );

            const result = await getUserListMetadata('list1');

            expect(prisma.list.findUnique).toHaveBeenCalledWith({
                where: { id: 'list1' },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    userId: true,
                    user: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
            expect(result).toEqual({
                id: 'list1',
                name: 'My Favorites',
                user: { name: 'Test User' },
            });
        });

        test('should return null when list not found', async () => {
            vi.mocked(prisma.list.findUnique).mockResolvedValue(null);

            const result = await getUserListMetadata('nonexistent');

            expect(result).toBeNull();
        });

        test('should handle null user name', async () => {
            const mockList = {
                id: 'list1',
                name: 'My Favorites',
                user: { name: null },
            };

            vi.mocked(prisma.list.findUnique).mockResolvedValue(
                mockList as any
            );

            const result = await getUserListMetadata('list1');

            expect(result?.user.name).toBe('Unknown User');
        });

        test('should return null on database error', async () => {
            vi.mocked(prisma.list.findUnique).mockRejectedValue(
                new Error('Database error')
            );

            const result = await getUserListMetadata('list1');

            expect(result).toBeNull();
        });
    });
});

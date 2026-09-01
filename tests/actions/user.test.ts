import {
    getUserProfile,
    getUserReviews,
    getUserStats,
    isFollowedByCurrentUser,
    hasUserReviewed,
    hasUserBookmarked,
    getUserMediaLists,
    getAllUserLists,
    getOtherUserLists,
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
            count: vi.fn(),
        },
        listMediaItem: {
            findUnique: vi.fn(),
            count: vi.fn(),
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
                orderBy: { consumedDate: 'desc' } as any,
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

    const mockListRow = (
        id: string,
        name: string,
        type: 'LIST' | 'BOOKMARK' = 'LIST',
        mediaItems = 0
    ) => ({
        id,
        name,
        image: `${id}.jpg`,
        type,
        _count: { mediaItems },
    });

    const mockSession = async (userId: string | null) => {
        const { auth } = await import('@/lib/auth/auth');
        vi.mocked(auth.api.getSession).mockResolvedValue(
            userId ? ({ user: { id: userId }, session: {} } as any) : null
        );
    };

    describe('getUserMediaLists', () => {
        test('should return user lists when user is viewing their own profile', async () => {
            await mockSession('user1');

            vi.mocked(prisma.list.findMany).mockResolvedValue([
                mockListRow('list1', 'My Favorites', 'LIST', 3),
                mockListRow('list2', 'To Watch'),
            ] as any);
            vi.mocked(prisma.list.count).mockResolvedValue(2 as any);

            const result = await getUserMediaLists('user1');

            expect(prisma.list.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: 'user1' },
                    take: 5,
                })
            );
            expect(result.total).toBe(2);
            expect(result.lists).toHaveLength(2);
            expect(result.lists[0]).toEqual({
                id: 'list1',
                name: 'My Favorites',
                image: 'list1.jpg',
                type: 'LIST',
                totalItems: 3,
            });
        });

        test('should exclude bookmark lists when viewing other users profile', async () => {
            await mockSession('currentUser');

            vi.mocked(prisma.list.findMany).mockResolvedValue([
                mockListRow('list1', 'Recommendations'),
            ] as any);
            vi.mocked(prisma.list.count).mockResolvedValue(1 as any);

            const result = await getUserMediaLists('otherUser');

            expect(prisma.list.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId: 'otherUser',
                        type: 'LIST',
                        isPublic: true,
                    },
                })
            );
            expect(result.lists).toHaveLength(1);
        });

        test('should exclude bookmark lists for anonymous visitors', async () => {
            await mockSession(null);

            vi.mocked(prisma.list.findMany).mockResolvedValue([]);
            vi.mocked(prisma.list.count).mockResolvedValue(0 as any);

            await getUserMediaLists('user1');

            expect(prisma.list.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: 'user1', type: 'LIST', isPublic: true },
                })
            );
        });

        test('should respect the given limit', async () => {
            await mockSession('user1');

            vi.mocked(prisma.list.findMany).mockResolvedValue([]);
            vi.mocked(prisma.list.count).mockResolvedValue(0 as any);

            await getUserMediaLists('user1', 2);

            expect(prisma.list.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 2 })
            );
        });

        test('should return empty result when user has no lists', async () => {
            await mockSession('user1');

            vi.mocked(prisma.list.findMany).mockResolvedValue([]);
            vi.mocked(prisma.list.count).mockResolvedValue(0 as any);

            const result = await getUserMediaLists('user1');

            expect(result).toEqual({ lists: [], total: 0 });
        });

        test('should throw error when database query fails', async () => {
            await mockSession('user1');

            vi.mocked(prisma.list.findMany).mockRejectedValue(
                new Error('Database error')
            );
            vi.mocked(prisma.list.count).mockResolvedValue(0 as any);

            await expect(getUserMediaLists('user1')).rejects.toThrow(
                'Could not fetch user media lists.'
            );
        });
    });

    describe('getAllUserLists', () => {
        test('should return every visible list without limiting or paginating', async () => {
            await mockSession('user1');

            vi.mocked(prisma.list.findMany).mockResolvedValue([
                mockListRow('list1', 'My Favorites', 'LIST', 1),
                mockListRow('list2', 'To Watch'),
            ] as any);

            const result = await getAllUserLists('user1');

            const args = vi.mocked(prisma.list.findMany).mock
                .calls[0][0] as any;
            expect(args.where).toEqual({ userId: 'user1' });
            expect(args.take).toBeUndefined();
            expect(args.skip).toBeUndefined();
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: 'list1',
                name: 'My Favorites',
                image: 'list1.jpg',
                type: 'LIST',
                totalItems: 1,
            });
        });

        test('should exclude bookmark lists when viewing other users lists', async () => {
            await mockSession('currentUser');

            vi.mocked(prisma.list.findMany).mockResolvedValue([]);

            const result = await getAllUserLists('otherUser');

            expect(prisma.list.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId: 'otherUser',
                        type: 'LIST',
                        isPublic: true,
                    },
                })
            );
            expect(result).toEqual([]);
        });

        test('should throw error when database query fails', async () => {
            await mockSession('user1');

            vi.mocked(prisma.list.findMany).mockRejectedValue(
                new Error('Database error')
            );

            await expect(getAllUserLists('user1')).rejects.toThrow(
                'Could not fetch user lists.'
            );
        });
    });

    describe('getOtherUserLists', () => {
        test('should exclude the list currently being viewed', async () => {
            await mockSession('user1');

            vi.mocked(prisma.list.findMany).mockResolvedValue([
                mockListRow('list2', 'To Watch'),
            ] as any);
            vi.mocked(prisma.list.count).mockResolvedValue(1 as any);

            const result = await getOtherUserLists('user1', 'list1');

            expect(prisma.list.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: 'user1', id: { not: 'list1' } },
                    take: 5,
                })
            );
            expect(result).toEqual({
                lists: [
                    {
                        id: 'list2',
                        name: 'To Watch',
                        image: 'list2.jpg',
                        type: 'LIST',
                        totalItems: 0,
                    },
                ],
                total: 1,
            });
        });

        test('should exclude bookmark lists when viewing other users lists', async () => {
            await mockSession('currentUser');

            vi.mocked(prisma.list.findMany).mockResolvedValue([]);
            vi.mocked(prisma.list.count).mockResolvedValue(0 as any);

            await getOtherUserLists('otherUser', 'list1');

            expect(prisma.list.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId: 'otherUser',
                        type: 'LIST',
                        isPublic: true,
                        id: { not: 'list1' },
                    },
                })
            );
        });

        test('should throw error when database query fails', async () => {
            await mockSession('user1');

            vi.mocked(prisma.list.findMany).mockRejectedValue(
                new Error('Database error')
            );
            vi.mocked(prisma.list.count).mockResolvedValue(0 as any);

            await expect(getOtherUserLists('user1', 'list1')).rejects.toThrow(
                'Could not fetch other user lists.'
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
                _count: { mediaItems: 1 },
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
                    _count: { select: { mediaItems: true } },
                    mediaItems: {
                        where: undefined,
                        include: { media: true },
                        orderBy: [{ createdAt: 'desc' }],
                        skip: 0,
                        take: 15,
                    },
                },
            });
            expect(result?.id).toBe('list1');
            expect(result?.mediaItems).toHaveLength(1);
            expect(result?.mediaItems[0].media.title).toBe('Movie 1');
            expect(result?.totalItems).toBe(1);
            expect(result?.totalPages).toBe(1);
            expect(result?.currentPage).toBe(1);
        });

        test('should page through the media items 15 at a time', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findFirst).mockResolvedValue({
                id: 'list1',
                name: 'My Favorites',
                image: null,
                type: 'LIST',
                user: { id: 'user1', name: 'Test User', image: null },
                _count: { mediaItems: 40 },
                mediaItems: [],
            } as any);

            const result = await getUserMediaListData('user1', 'list1', 3);

            expect(prisma.list.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.objectContaining({
                        mediaItems: expect.objectContaining({
                            skip: 30,
                            take: 15,
                        }),
                    }),
                })
            );
            expect(result?.totalItems).toBe(40);
            expect(result?.totalPages).toBe(3);
            expect(result?.currentPage).toBe(3);
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

        test('should filter the media items by title and paginate the matches', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findFirst).mockResolvedValue({
                id: 'list1',
                name: 'My Favorites',
                image: null,
                type: 'LIST',
                user: { id: 'user1', name: 'Test User', image: null },
                _count: { mediaItems: 40 },
                mediaItems: [],
            } as any);
            vi.mocked(prisma.listMediaItem.count).mockResolvedValue(2 as any);

            const result = await getUserMediaListData(
                'user1',
                'list1',
                1,
                15,
                '  matrix  '
            );

            const expectedWhere = {
                media: {
                    title: { contains: 'matrix', mode: 'insensitive' },
                },
            };

            expect(prisma.list.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.objectContaining({
                        mediaItems: expect.objectContaining({
                            where: expectedWhere,
                        }),
                    }),
                })
            );
            expect(prisma.listMediaItem.count).toHaveBeenCalledWith({
                where: { listId: 'list1', ...expectedWhere },
            });
            // The header keeps the list size; pagination follows the matches.
            expect(result?.totalItems).toBe(40);
            expect(result?.matchingItems).toBe(2);
            expect(result?.totalPages).toBe(1);
        });

        test('should let a visitor open a public list', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'someoneElse' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findFirst).mockResolvedValue({
                id: 'list1',
                name: 'My Favorites',
                image: null,
                type: 'LIST',
                isPublic: true,
                user: { id: 'user1', name: 'Test User', image: null },
                _count: { mediaItems: 0 },
                mediaItems: [],
            } as any);

            const result = await getUserMediaListData('user1', 'list1');

            expect(result?.id).toBe('list1');
            expect(result?.isPublic).toBe(true);
        });

        test('should redirect a visitor away from a private list', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'someoneElse' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findFirst).mockResolvedValue({
                id: 'list1',
                name: 'My Favorites',
                image: null,
                type: 'LIST',
                isPublic: false,
                user: { id: 'user1', name: 'Test User', image: null },
                _count: { mediaItems: 0 },
                mediaItems: [],
            } as any);

            // `redirect` throws to unwind the render, which surfaces here as
            // the action's own error.
            await expect(
                getUserMediaListData('user1', 'list1')
            ).rejects.toThrow();
        });

        test('should filter the media items by media type', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findFirst).mockResolvedValue({
                id: 'list1',
                name: 'My Favorites',
                image: null,
                type: 'LIST',
                user: { id: 'user1', name: 'Test User', image: null },
                _count: { mediaItems: 40 },
                mediaItems: [],
            } as any);
            vi.mocked(prisma.listMediaItem.count).mockResolvedValue(7 as any);

            const result = await getUserMediaListData(
                'user1',
                'list1',
                1,
                15,
                '',
                'film'
            );

            expect(prisma.list.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.objectContaining({
                        mediaItems: expect.objectContaining({
                            where: { media: { type: 'FILM' } },
                        }),
                    }),
                })
            );
            expect(result?.matchingItems).toBe(7);
        });

        test('should combine the search and the media type filters', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findFirst).mockResolvedValue({
                id: 'list1',
                name: 'My Favorites',
                image: null,
                type: 'LIST',
                user: { id: 'user1', name: 'Test User', image: null },
                _count: { mediaItems: 40 },
                mediaItems: [],
            } as any);
            vi.mocked(prisma.listMediaItem.count).mockResolvedValue(1 as any);

            await getUserMediaListData(
                'user1',
                'list1',
                1,
                15,
                'matrix',
                'film'
            );

            expect(prisma.listMediaItem.count).toHaveBeenCalledWith({
                where: {
                    listId: 'list1',
                    media: {
                        title: { contains: 'matrix', mode: 'insensitive' },
                        type: 'FILM',
                    },
                },
            });
        });

        test('should ignore the "all" media type', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findFirst).mockResolvedValue({
                id: 'list1',
                name: 'My Favorites',
                image: null,
                type: 'LIST',
                user: { id: 'user1', name: 'Test User', image: null },
                _count: { mediaItems: 40 },
                mediaItems: [],
            } as any);

            await getUserMediaListData('user1', 'list1', 1, 15, '', 'all');

            expect(prisma.list.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.objectContaining({
                        mediaItems: expect.objectContaining({
                            where: undefined,
                        }),
                    }),
                })
            );
            expect(prisma.listMediaItem.count).not.toHaveBeenCalled();
        });

        describe('ordering', () => {
            const mockList = async () => {
                const { auth } = await import('@/lib/auth/auth');
                vi.mocked(auth.api.getSession).mockResolvedValue({
                    user: { id: 'user1' },
                    session: {},
                } as any);

                vi.mocked(prisma.list.findFirst).mockResolvedValue({
                    id: 'list1',
                    name: 'My Favorites',
                    image: null,
                    type: 'LIST',
                    user: { id: 'user1', name: 'Test User', image: null },
                    _count: { mediaItems: 3 },
                    mediaItems: [],
                } as any);
            };

            const orderByOf = () =>
                (vi.mocked(prisma.list.findFirst).mock.calls[0][0] as any)
                    .include.mediaItems.orderBy;

            test('should default to newest added first', async () => {
                await mockList();

                await getUserMediaListData('user1', 'list1');

                expect(orderByOf()).toEqual([{ createdAt: 'desc' }]);
            });

            test('should sort by release date descending, nulls last', async () => {
                await mockList();

                await getUserMediaListData(
                    'user1',
                    'list1',
                    1,
                    15,
                    '',
                    '',
                    'year-desc'
                );

                expect(orderByOf()).toEqual([
                    { media: { year: { sort: 'desc', nulls: 'last' } } },
                    { createdAt: 'desc' },
                ]);
            });

            test('should sort by release date ascending, nulls last', async () => {
                await mockList();

                await getUserMediaListData(
                    'user1',
                    'list1',
                    1,
                    15,
                    '',
                    '',
                    'year-asc'
                );

                expect(orderByOf()).toEqual([
                    { media: { year: { sort: 'asc', nulls: 'last' } } },
                    { createdAt: 'desc' },
                ]);
            });

            test('should sort by oldest added first', async () => {
                await mockList();

                await getUserMediaListData(
                    'user1',
                    'list1',
                    1,
                    15,
                    '',
                    '',
                    'added-asc'
                );

                expect(orderByOf()).toEqual([{ createdAt: 'asc' }]);
            });

            test('should fall back to the default order for an unknown sort', async () => {
                await mockList();

                await getUserMediaListData(
                    'user1',
                    'list1',
                    1,
                    15,
                    '',
                    '',
                    'bogus'
                );

                expect(orderByOf()).toEqual([{ createdAt: 'desc' }]);
            });
        });

        test('should not run an extra count query when there is no search', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findFirst).mockResolvedValue({
                id: 'list1',
                name: 'My Favorites',
                image: null,
                type: 'LIST',
                user: { id: 'user1', name: 'Test User', image: null },
                _count: { mediaItems: 40 },
                mediaItems: [],
            } as any);

            const result = await getUserMediaListData('user1', 'list1');

            expect(prisma.listMediaItem.count).not.toHaveBeenCalled();
            expect(result?.matchingItems).toBe(40);
            expect(result?.totalPages).toBe(3);
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
                _count: { mediaItems: 1 },
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
        test('should return list metadata for the owner', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            const mockList = {
                id: 'list1',
                name: 'My Favorites',
                type: 'LIST',
                userId: 'user1',
                isPublic: false,
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
                    isPublic: true,
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

        test('should return metadata of a public list to a visitor', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'someoneElse' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findUnique).mockResolvedValue({
                id: 'list1',
                name: 'My Favorites',
                type: 'LIST',
                userId: 'user1',
                isPublic: true,
                user: { name: 'Test User' },
            } as any);

            const result = await getUserListMetadata('list1');

            expect(result?.name).toBe('My Favorites');
        });

        test('should hide the metadata of a private list from a visitor', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'someoneElse' },
                session: {},
            } as any);

            vi.mocked(prisma.list.findUnique).mockResolvedValue({
                id: 'list1',
                name: 'My Favorites',
                type: 'LIST',
                userId: 'user1',
                isPublic: false,
                user: { name: 'Test User' },
            } as any);

            const result = await getUserListMetadata('list1');

            expect(result).toBeNull();
        });

        test('should return null when list not found', async () => {
            vi.mocked(prisma.list.findUnique).mockResolvedValue(null);

            const result = await getUserListMetadata('nonexistent');

            expect(result).toBeNull();
        });

        test('should handle null user name', async () => {
            const { auth } = await import('@/lib/auth/auth');
            vi.mocked(auth.api.getSession).mockResolvedValue({
                user: { id: 'user1' },
                session: {},
            } as any);

            const mockList = {
                id: 'list1',
                name: 'My Favorites',
                type: 'LIST',
                userId: 'user1',
                isPublic: false,
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

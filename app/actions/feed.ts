'use server';

import { auth } from '@/lib/auth/auth';
import { logger } from '@/lib/axiom/server';
import {
    FEED_PAGE_SIZE,
    FEED_PREVIEW_LIMIT,
    FEED_WINDOW_DAYS,
} from '@/lib/constants';
import { prisma } from '@/lib/prisma';
import { FeedFilter, SafeFeedPage, SafeFeedPreview } from '@/lib/types';
import { toSafeReviewWithMedia } from '@/utils/review-utils';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';

const FEED_INCLUDE = { user: true, media: true } as const;

/**
 * The feed follows the post date, like the rest of the app. `id` breaks ties
 * so paging never repeats or skips a review.
 */
const FEED_ORDER_BY: Prisma.ReviewOrderByWithRelationInput[] = [
    { createdAt: 'desc' },
    { id: 'asc' },
];

/** Reviews posted in the last {@link FEED_WINDOW_DAYS} days. */
const feedWindow = (): Prisma.DateTimeFilter => {
    const start = new Date();
    start.setDate(start.getDate() - FEED_WINDOW_DAYS);

    return { gte: start };
};

/** Ids the viewer follows. Empty for anonymous visitors and for loners alike. */
const getFollowingIds = async (): Promise<string[]> => {
    const session = await auth.api.getSession({ headers: await headers() });
    const currentUserId = session?.user?.id;

    if (!currentUserId) return [];

    const follows = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
    });

    return follows.map((follow) => follow.followingId);
};

/**
 * Home page preview: reviews from people the viewer follows come first, and
 * the rest of the slots are topped up with the newest reviews from everyone
 * else. `total` counts the whole window so the caller can decide whether the
 * "see more" link is worth showing.
 */
export const getFeedReviewsPreview = async (
    limit: number = FEED_PREVIEW_LIMIT
): Promise<SafeFeedPreview> => {
    const where: Prisma.ReviewWhereInput = { createdAt: feedWindow() };

    try {
        const followingIds = await getFollowingIds();

        const [followedReviews, total] = await Promise.all([
            followingIds.length
                ? prisma.review.findMany({
                      where: { ...where, userId: { in: followingIds } },
                      include: FEED_INCLUDE,
                      orderBy: FEED_ORDER_BY,
                      take: limit,
                  })
                : [],
            prisma.review.count({ where }),
        ]);

        const remaining = limit - followedReviews.length;
        const otherReviews =
            remaining > 0
                ? await prisma.review.findMany({
                      where: followingIds.length
                          ? { ...where, userId: { notIn: followingIds } }
                          : where,
                      include: FEED_INCLUDE,
                      orderBy: FEED_ORDER_BY,
                      take: remaining,
                  })
                : [];

        const reviews = [...followedReviews, ...otherReviews].map(
            toSafeReviewWithMedia
        );

        logger.info('GET /actions/feed', {
            method: 'getFeedReviewsPreview',
            followingCount: followingIds.length,
            followedReviews: followedReviews.length,
            reviewCount: reviews.length,
            total,
        });

        return { reviews, total };
    } catch (error) {
        // The feed is a secondary section of the home page: an empty preview
        // hides it instead of taking the whole page down with it.
        logger.error('GET /actions/feed', {
            method: 'getFeedReviewsPreview',
            error,
        });
        return { reviews: [], total: 0 };
    }
};

/**
 * Feed screen: one page of reviews, newest posted first. `following` narrows
 * the feed to the people the viewer follows; `all` mixes everyone together.
 */
export const getFeedReviews = async (
    page: number = 1,
    pageSize: number = FEED_PAGE_SIZE,
    filter: FeedFilter = 'all'
): Promise<SafeFeedPage> => {
    try {
        const where: Prisma.ReviewWhereInput = { createdAt: feedWindow() };

        if (filter === 'following') {
            const followingIds = await getFollowingIds();

            if (!followingIds.length) {
                logger.info('GET /actions/feed', {
                    method: 'getFeedReviews',
                    filter,
                    warn: 'Viewer follows nobody',
                });
                return {
                    reviews: [],
                    total: 0,
                    totalPages: 0,
                    currentPage: page,
                };
            }

            where.userId = { in: followingIds };
        }

        const [reviews, total] = await prisma.$transaction([
            prisma.review.findMany({
                where,
                include: FEED_INCLUDE,
                orderBy: FEED_ORDER_BY,
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.review.count({ where }),
        ]);

        logger.info('GET /actions/feed', {
            method: 'getFeedReviews',
            filter,
            currentPage: page,
            reviewCount: reviews.length,
            total,
        });

        return {
            reviews: reviews.map(toSafeReviewWithMedia),
            total,
            totalPages: Math.ceil(total / pageSize),
            currentPage: page,
        };
    } catch (error) {
        logger.error('GET /actions/feed', {
            method: 'getFeedReviews',
            error,
            filter,
            page,
        });
        throw new Error('Could not fetch feed reviews.');
    }
};

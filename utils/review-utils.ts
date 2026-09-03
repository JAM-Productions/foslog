import { MediaType } from '@/lib/store';
import { SafeReviewWithMedia } from '@/lib/types';
import { Prisma } from '@prisma/client';

export type ReviewWithUserAndMedia = Prisma.ReviewGetPayload<{
    include: { user: true; media: true };
}>;

/**
 * Maps a Prisma review row (with its author and media) to the shape the UI
 * consumes. Emails never leave the server, and nullable columns collapse to
 * `undefined` so client components can rely on optional props.
 */
export const toSafeReviewWithMedia = (
    review: ReviewWithUserAndMedia
): SafeReviewWithMedia => ({
    id: review.id,
    mediaId: review.mediaId,
    userId: review.userId,
    rating: review.rating ?? undefined,
    liked: review.liked ?? undefined,
    review: review.review ?? undefined,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    consumedMoreThanOnce: review.consumedMoreThanOnce,
    consumedDate: review.consumedDate ?? review.createdAt,
    totalComments: review.totalComments,
    totalLikes: review.totalLikes,
    user: {
        id: review.user.id,
        name: review.user.name ?? 'Unknown User',
        email: '', // Don't expose email
        image: review.user.image ?? undefined,
        bio: review.user.bio ?? undefined,
        joinedAt: review.user.createdAt,
        totalFollowers: review.user.totalFollowers,
        totalFollowing: review.user.totalFollowing,
    },
    media: {
        id: review.media.id,
        title: review.media.title,
        type: review.media.type.toLowerCase() as MediaType,
        year: review.media.year ?? undefined,
        director: review.media.director ?? undefined,
        author: review.media.author ?? undefined,
        artist: review.media.artist ?? undefined,
        genre: review.media.genre,
        poster: review.media.poster ?? undefined,
        cover: review.media.cover ?? undefined,
        description: review.media.description,
        averageRating: review.media.averageRating,
        totalReviews: review.media.totalReviews,
        totalLikes: review.media.totalLikes,
        totalDislikes: review.media.totalDislikes,
    },
});

import { Comment, MediaItem, Review, User } from './store';

export type SafeMediaItem = MediaItem;
export type SafeReview = Review & { user: User };
export type SafeComment = Comment & { user: User };
export type SafeMediaItemWithReviews = SafeMediaItem & {
    reviews: SafeReview[];
    totalPages: number;
    currentPage: number;
};
export type SafeReviewWithMedia = SafeReview & {
    media: SafeMediaItem;
};

export type SafeReviewWithComments = SafeReview & {
    comments: SafeComment[];
    totalPages: number;
    currentPage: number;
};

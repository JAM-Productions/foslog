import { MediaItem, Review, User } from './store';

export type SafeMediaItem = MediaItem;
export type SafeReview = Review & { user: User };
export type SafeMediaItemWithReviews = SafeMediaItem & {
    reviews: SafeReview[];
};

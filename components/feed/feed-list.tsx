import { ProfileReviewCard } from '@/components/profile/profile-review-card';
import { SafeReviewWithMedia } from '@/lib/types';

/**
 * Grid of feed reviews. Callers decide what an empty feed looks like: the home
 * section hides itself, the feed screen shows an empty state.
 */
export function FeedList({ reviews }: { reviews: SafeReviewWithMedia[] }) {
    return (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {reviews.map((review, index) => (
                <div
                    key={review.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <ProfileReviewCard
                        review={review}
                        showAuthor
                    />
                </div>
            ))}
        </div>
    );
}

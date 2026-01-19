import { ReviewCard } from '@/components/review/review-card';
import { SafeReview } from '@/lib/types';

export function ReviewList({
    reviews,
    mediaType,
}: {
    reviews: SafeReview[];
    mediaType?: string;
}) {
    return (
        <div className="space-y-6">
            {reviews.map((review, index) => (
                <div
                    key={review.id}
                    className="animate-in fade-in slide-in-from-top-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <ReviewCard
                        review={review}
                        mediaType={mediaType}
                    />
                </div>
            ))}
        </div>
    );
}

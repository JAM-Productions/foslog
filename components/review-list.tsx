import { ReviewCard } from '@/components/review-card';
import { Review } from '@/lib/store';

export function ReviewList({ reviews }: { reviews: Review[] }) {
    return (
        <div className="space-y-6">
            {reviews.map((review, index) => (
                <div
                    key={review.id}
                    className="animate-in fade-in slide-in-from-top-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <ReviewCard review={review} />
                </div>
            ))}
        </div>
    );
}

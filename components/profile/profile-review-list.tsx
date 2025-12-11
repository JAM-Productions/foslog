'use client';

import { ProfileReviewCard } from './profile-review-card';
import { SafeReviewWithMedia } from '@/lib/types';

interface ProfileReviewListProps {
    reviews: SafeReviewWithMedia[];
}

export function ProfileReviewList({ reviews }: ProfileReviewListProps) {
    if (reviews.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-muted-foreground text-lg">No reviews yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {reviews.map((review, index) => (
                <div
                    key={review.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <ProfileReviewCard review={review} />
                </div>
            ))}
        </div>
    );
}

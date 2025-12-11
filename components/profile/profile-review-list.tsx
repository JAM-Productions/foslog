'use client';

import { ProfileReviewCard } from './profile-review-card';
import { SafeReviewWithMedia } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface ProfileReviewListProps {
    reviews: SafeReviewWithMedia[];
}

export function ProfileReviewList({ reviews }: ProfileReviewListProps) {
    const t = useTranslations('ProfilePage');

    if (reviews.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-muted-foreground text-lg">{t('noReviews')}</p>
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

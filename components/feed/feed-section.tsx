'use client';

import { Button } from '@/components/button/button';
import { FeedList } from '@/components/feed/feed-list';
import { useRouter } from '@/i18n/navigation';
import { SafeReviewWithMedia } from '@/lib/types';
import { Rss } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface FeedSectionProps {
    reviews: SafeReviewWithMedia[];
    /** Reviews inside the feed window, which may exceed the ones shown here. */
    total: number;
}

/**
 * Recent community reviews, right below the media grid. Renders nothing when
 * nobody has logged a review lately, so a quiet month leaves the home page
 * exactly as it was.
 */
export function FeedSection({ reviews, total }: FeedSectionProps) {
    const t = useTranslations('FeedPage');
    const router = useRouter();

    if (reviews.length === 0) {
        return null;
    }

    return (
        <div
            className="mb-8"
            data-testid="feed-section"
        >
            <div className="mb-6 flex items-center gap-3">
                <div className="bg-primary/10 hidden rounded-lg p-2 sm:flex">
                    <Rss className="text-primary h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                        {t('title')}
                    </h2>
                    <p className="text-muted-foreground hidden sm:block">
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            <FeedList reviews={reviews} />

            {total > reviews.length && (
                <div className="mt-6 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/feed')}
                    >
                        {t('seeMore')}
                    </Button>
                </div>
            )}
        </div>
    );
}

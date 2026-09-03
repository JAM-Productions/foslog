'use client';

import { Button } from '@/components/button/button';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/auth-provider';
import { FeedFilter } from '@/lib/types';
import { useTranslations } from 'next-intl';

export interface FeedEmptyStateProps {
    filter: FeedFilter;
}

/**
 * Empty feed. The "following" tab is also what an anonymous visitor lands on
 * when they pick it, so it doubles as an invitation to log in.
 */
export function FeedEmptyState({ filter }: FeedEmptyStateProps) {
    const t = useTranslations('FeedPage');
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const isFollowing = filter === 'following';

    return (
        <div
            className="py-16 text-center"
            data-testid="feed-empty-state"
        >
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <span className="text-2xl">📭</span>
            </div>
            <p className="text-muted-foreground mb-4">
                {isFollowing ? t('noFollowingReviews') : t('noReviews')}
            </p>
            {isFollowing && !isAuthenticated && !isLoading && (
                <Button onClick={() => router.push('/login')}>
                    {t('loginToSeeFollowing')}
                </Button>
            )}
        </div>
    );
}

'use client';

import { User } from '@/lib/store';
import { UserStats } from '@/app/actions/user';
import { RatingDistribution } from './rating-distribution';
import { UserIcon, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Button } from '../button/button';
import { useAuth } from '@/lib/auth/auth-provider';
import { useRouter } from '@/i18n/navigation';
import { startTransition, useOptimistic, useState } from 'react';
import { useToastStore } from '@/lib/toast-store';

interface ProfileHeaderProps {
    user: User;
    stats: UserStats;
    isUserFollowing: boolean;
}

export function ProfileHeader({
    user,
    stats,
    isUserFollowing,
}: ProfileHeaderProps) {
    const t = useTranslations('ProfilePage');
    const tGenres = useTranslations('MediaGenres');
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [isFollowing, setIsFollowing] = useState(false);
    const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(
        isUserFollowing,
        (prev) => !prev
    );
    const { showToast } = useToastStore();

    const toggleFollowButton = async () => {
        if (!currentUser) {
            return router.push('/login');
        }

        if (isFollowing) return;

        setIsFollowing(true);

        const method = optimisticFollowing ? 'DELETE' : 'POST';

        startTransition(async () => {
            try {
                setOptimisticFollowing(optimisticFollowing);
                const response = await fetch(`/api/user/${user.id}/follow`, {
                    method,
                });

                if (!response.ok) {
                    throw new Error('Toggle follow failed');
                }

                router.refresh();
            } catch (error) {
                showToast(t('toggleFollowFailed'), 'error');
            } finally {
                setIsFollowing(false);
            }
        });
    };

    return (
        <div className="mb-8 grid items-start gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
                <div className="flex flex-col gap-3">
                    <div className="bg-card text-card-foreground flex h-fit min-h-[206px] flex-col items-center rounded-lg border p-6 shadow-sm sm:flex-row sm:gap-8">
                        <div className="mb-4 sm:mb-0">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name}
                                    width={120}
                                    height={120}
                                    className="h-24 w-24 rounded-full border-4 border-white shadow-md sm:h-32 sm:w-32 dark:border-gray-800"
                                    unoptimized
                                />
                            ) : (
                                <div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full border-4 border-white shadow-md sm:h-32 sm:w-32 dark:border-gray-800">
                                    <UserIcon className="h-12 w-12 text-gray-400 sm:h-16 sm:w-16" />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-1 flex-col items-center text-center sm:items-start sm:text-left">
                            <h1 className="text-2xl font-bold sm:text-3xl">
                                {user.name}
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {t('joined', {
                                    date: new Date(
                                        user.joinedAt
                                    ).toLocaleDateString(),
                                })}
                            </p>

                            {user.bio && (
                                <p className="mt-4 max-w-lg text-sm leading-relaxed">
                                    {user.bio}
                                </p>
                            )}

                            <div className="mt-6 flex flex-wrap justify-center gap-6 sm:justify-start">
                                <div className="flex flex-col items-center sm:items-start">
                                    <span className="text-xl font-bold">
                                        {stats.totalReviews}
                                    </span>
                                    <span className="text-muted-foreground text-xs tracking-wider uppercase">
                                        {t('totalReviews')}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center sm:items-start">
                                    <span className="text-xl font-bold">
                                        {stats.totalLikesReceived}
                                    </span>
                                    <span className="text-muted-foreground text-xs tracking-wider uppercase">
                                        {t('totalLikesReceived')}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center sm:items-start">
                                    <span className="text-xl font-bold">
                                        {stats.averageRating.toFixed(1)}
                                    </span>
                                    <span className="text-muted-foreground text-xs tracking-wider uppercase">
                                        {t('averageRating')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {currentUser && currentUser.id !== user.id && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex gap-2"
                            onClick={() => toggleFollowButton()}
                            disabled={isFollowing}
                        >
                            {optimisticFollowing ? t('unfollow') : t('follow')}
                        </Button>
                    )}
                </div>
                {stats.favoriteGenres.length > 0 && (
                    <div className="bg-card rounded-lg border p-4 shadow-sm">
                        <h3 className="mb-3 font-semibold">
                            {t('favoriteGenres')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {stats.favoriteGenres.map((g) => (
                                <span
                                    key={g.genre}
                                    className="bg-accent text-accent-foreground rounded-full px-2.5 py-1 text-xs font-medium"
                                >
                                    {tGenres(g.genre as string)} ({g.count})
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <RatingDistribution distribution={stats.ratingDistribution} />
            </div>
        </div>
    );
}

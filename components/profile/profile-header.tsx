'use client';

import { MediaType, User } from '@/lib/store';
import { UserStats } from '@/app/actions/user';
import { RatingDistribution } from './rating-distribution';
import { CollapsibleCard } from '@/components/collapsible-card';
import { getMediaTypeIcon } from '@/utils/media-type';
import { DownloadIcon, HeartIcon, StarIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '../button/button';
import { useAuth } from '@/lib/auth/auth-provider';
import { useRouter } from '@/i18n/navigation';
import { startTransition, useOptimistic, useState } from 'react';
import { useToastStore } from '@/lib/toast-store';
import { useFollowsModalStore } from '@/lib/follows-modal-store';
import { useImportReviewsModalStore } from '@/lib/import-reviews-modal-store';

interface ProfileHeaderProps {
    user: User;
    stats: UserStats;
    isUserFollowing: boolean;
}

const MEDIA_TYPE_LABEL_KEYS: Record<MediaType, string> = {
    film: 'films',
    series: 'series',
    game: 'games',
    book: 'books',
    music: 'music',
};

/**
 * Coarse buckets keep the phrasing natural ("3 weeks ago") without pulling in
 * a date library just for the profile header.
 */
const formatRelativeDate = (date: Date, locale: string) => {
    const days = Math.round((date.getTime() - Date.now()) / 86_400_000);
    const magnitude = Math.abs(days);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (magnitude < 7) return rtf.format(days, 'day');
    if (magnitude < 30) return rtf.format(Math.round(days / 7), 'week');
    if (magnitude < 365) return rtf.format(Math.round(days / 30), 'month');
    return rtf.format(Math.round(days / 365), 'year');
};

export function ProfileHeader({
    user,
    stats,
    isUserFollowing,
}: ProfileHeaderProps) {
    const t = useTranslations('ProfilePage');
    const tToast = useTranslations('Toast');
    const tGenres = useTranslations('MediaGenres');
    const tTypes = useTranslations('MediaTypes');
    const tImport = useTranslations('ImportReviewsModal');
    const locale = useLocale();
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [isFollowing, setIsFollowing] = useState(false);
    const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(
        isUserFollowing,
        (prev) => !prev
    );
    const { showToast } = useToastStore();
    const { showModal } = useFollowsModalStore();
    const { showModal: showImportModal } = useImportReviewsModalStore();

    const isOwnProfile = currentUser?.id === user.id;

    const optimisticTotalFollowers =
        isUserFollowing === optimisticFollowing
            ? user.totalFollowers
            : optimisticFollowing
              ? user.totalFollowers + 1
              : user.totalFollowers - 1;

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
            } catch {
                showToast(tToast('toggleFollowFailed'), 'error');
            } finally {
                setIsFollowing(false);
            }
        });
    };

    const formatCount = (value: number) =>
        new Intl.NumberFormat(locale, {
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(value);

    const memberSince = new Date(user.joinedAt).toLocaleDateString(locale, {
        month: 'short',
        year: 'numeric',
    });

    const lastReviewAt = stats.lastReviewAt
        ? new Date(stats.lastReviewAt)
        : null;

    const metrics = [
        {
            key: 'reviews',
            label: t('totalReviews'),
            value: formatCount(stats.totalReviews),
        },
        {
            key: 'rating',
            label: t('averageRating'),
            value:
                stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—',
            icon:
                stats.averageRating > 0 ? (
                    <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ) : null,
        },
        {
            key: 'likes',
            label: t('totalLikesReceived'),
            value: formatCount(stats.totalLikesReceived),
            icon: <HeartIcon className="text-muted-foreground h-4 w-4" />,
        },
        {
            key: 'thisYear',
            // Passed as text so ICU does not group the digits ("2.026").
            label: t('reviewsThisYear', { year: String(stats.activityYear) }),
            value: formatCount(stats.reviewsThisYear),
        },
    ];

    const actions = (
        <>
            {currentUser && !isOwnProfile && (
                <Button
                    variant={optimisticFollowing ? 'outline' : 'default'}
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => toggleFollowButton()}
                    disabled={isFollowing}
                >
                    {optimisticFollowing ? t('unfollow') : t('follow')}
                </Button>
            )}
            {isOwnProfile && (
                <Button
                    variant="outline"
                    size="sm"
                    className="flex flex-1 items-center justify-center gap-2 sm:flex-none"
                    onClick={showImportModal}
                >
                    <DownloadIcon className="h-4 w-4" />
                    {tImport('importProfileButton')}
                </Button>
            )}
        </>
    );

    const hasActions = Boolean(currentUser);
    // Genres come from reviewed media, so they can never outlive the breakdown.
    const hasActivityCard = stats.mediaTypeBreakdown.length > 0;
    const hasRatingCard =
        Object.values(stats.ratingDistribution).some((count) => count > 0) ||
        stats.totalLikesGiven > 0 ||
        stats.totalDislikesGiven > 0;

    return (
        <div className="mb-8 flex flex-col gap-4">
            <section className="bg-card text-card-foreground overflow-hidden rounded-lg border p-4 shadow-sm sm:p-6">
                <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4 sm:items-start sm:gap-x-6">
                    <div className="flex-shrink-0 sm:row-span-2">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.name}
                                width={120}
                                height={120}
                                className="border-card h-20 w-20 rounded-full border-2 object-cover shadow-md sm:h-28 sm:w-28 sm:border-4"
                                unoptimized
                            />
                        ) : (
                            <div className="bg-muted border-card flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-md sm:h-28 sm:w-28 sm:border-4">
                                <UserIcon className="text-muted-foreground h-10 w-10 sm:h-14 sm:w-14" />
                            </div>
                        )}
                    </div>

                    <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-bold sm:text-2xl">
                                {user.name}
                            </h1>
                            <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 text-xs">
                                <span>
                                    {t('memberSince', { date: memberSince })}
                                </span>
                                {lastReviewAt && (
                                    <>
                                        <span aria-hidden="true">·</span>
                                        <span>
                                            {t('lastReview', {
                                                date: formatRelativeDate(
                                                    lastReviewAt,
                                                    locale
                                                ),
                                            })}
                                        </span>
                                    </>
                                )}
                            </p>
                        </div>

                        {hasActions && (
                            <div className="hidden shrink-0 gap-2 sm:flex">
                                {actions}
                            </div>
                        )}
                    </div>

                    <div className="col-span-2 flex min-w-0 flex-col gap-3 sm:col-span-1 sm:col-start-2">
                        {user.bio && (
                            <p className="max-w-2xl text-sm leading-relaxed break-words">
                                {user.bio}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                            <button
                                type="button"
                                aria-label={t('seeFollowers')}
                                className="group flex cursor-pointer items-baseline gap-1.5 text-sm"
                                onClick={() =>
                                    !currentUser
                                        ? router.push('/login')
                                        : showModal(
                                              user.id,
                                              user.name,
                                              'followers'
                                          )
                                }
                            >
                                <span className="font-semibold">
                                    {optimisticTotalFollowers}
                                </span>
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                    {t('totalFollowers')}
                                </span>
                            </button>
                            <button
                                type="button"
                                aria-label={t('seeFollowing')}
                                className="group flex cursor-pointer items-baseline gap-1.5 text-sm"
                                onClick={() =>
                                    !currentUser
                                        ? router.push('/login')
                                        : showModal(
                                              user.id,
                                              user.name,
                                              'following'
                                          )
                                }
                            >
                                <span className="font-semibold">
                                    {user.totalFollowing}
                                </span>
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                    {t('totalFollowing')}
                                </span>
                            </button>
                        </div>

                        {hasActions && (
                            <div className="flex gap-2 sm:hidden">
                                {actions}
                            </div>
                        )}
                    </div>
                </div>

                <dl className="bg-border mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border sm:mt-6 sm:grid-cols-4">
                    {metrics.map((metric) => (
                        <div
                            key={metric.key}
                            className="bg-background px-4 py-3"
                        >
                            <dt className="text-muted-foreground text-xs font-medium">
                                {metric.label}
                            </dt>
                            <dd className="mt-1 flex items-center gap-1.5">
                                <span className="text-xl font-semibold tabular-nums sm:text-2xl">
                                    {metric.value}
                                </span>
                                {metric.icon}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            {(hasActivityCard || hasRatingCard) && (
                <div
                    className={`grid gap-4 ${
                        hasActivityCard && hasRatingCard ? 'md:grid-cols-2' : ''
                    }`}
                >
                    {hasActivityCard && (
                        <CollapsibleCard title={t('activityByType')}>
                            <ul className="mt-3 space-y-2.5">
                                {stats.mediaTypeBreakdown.map(
                                    ({ type, count }) => {
                                        const Icon = getMediaTypeIcon(type);
                                        const percentage = Math.round(
                                            (count / stats.totalReviews) * 100
                                        );

                                        return (
                                            <li
                                                key={type}
                                                className="flex items-center gap-3"
                                            >
                                                <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
                                                <span className="w-16 shrink-0 truncate text-sm">
                                                    {tTypes(
                                                        MEDIA_TYPE_LABEL_KEYS[
                                                            type
                                                        ]
                                                    )}
                                                </span>
                                                <div className="bg-background relative h-2 flex-1 overflow-hidden rounded-full">
                                                    <div
                                                        className="bg-primary h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="w-16 shrink-0 text-right text-xs tabular-nums">
                                                    <span className="font-medium">
                                                        {count}
                                                    </span>
                                                    <span className="text-muted-foreground">
                                                        {' '}
                                                        · {percentage}%
                                                    </span>
                                                </span>
                                            </li>
                                        );
                                    }
                                )}
                            </ul>

                            {stats.favoriteGenres.length > 0 && (
                                <div className="mt-4 border-t pt-4">
                                    <h3 className="font-semibold">
                                        {t('favoriteGenres')}
                                    </h3>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {stats.favoriteGenres.map((g) => (
                                            <span
                                                key={g.genre}
                                                className="bg-accent text-accent-foreground rounded-full px-2.5 py-1 text-xs font-medium"
                                            >
                                                {tGenres(g.genre as string)} (
                                                {g.count})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CollapsibleCard>
                    )}

                    {/* Too dense to earn its space on a phone. */}
                    <div className="hidden sm:block">
                        <RatingDistribution
                            distribution={stats.ratingDistribution}
                            likesGiven={stats.totalLikesGiven}
                            dislikesGiven={stats.totalDislikesGiven}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

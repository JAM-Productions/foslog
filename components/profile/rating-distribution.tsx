'use client';

import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

interface RatingDistributionProps {
    distribution: Record<number, number>;
    likesGiven?: number;
    dislikesGiven?: number;
}

const RATING_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export function RatingDistribution({
    distribution,
    likesGiven = 0,
    dislikesGiven = 0,
}: RatingDistributionProps) {
    const t = useTranslations('ProfilePage');
    const locale = useLocale();

    const stepCounts: Record<number, number> = {};
    Object.entries(distribution).forEach(([rating, count]) => {
        const step = Math.min(
            5,
            Math.max(0.5, Math.round(Number(rating) * 2) / 2)
        );
        stepCounts[step] = (stepCounts[step] || 0) + count;
    });

    const maxCount = Math.max(...Object.values(stepCounts), 0);
    const totalRatings = Object.values(stepCounts).reduce(
        (acc, count) => acc + count,
        0
    );
    const hasThumbs = likesGiven > 0 || dislikesGiven > 0;

    if (maxCount === 0 && !hasThumbs) {
        return null;
    }

    const formatStep = (step: number) =>
        new Intl.NumberFormat(locale, {
            minimumFractionDigits: step % 1 === 0 ? 0 : 1,
        }).format(step);

    return (
        <div className="bg-card text-card-foreground flex h-full w-full flex-col rounded-lg border p-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-semibold">{t('ratingDistribution')}</h3>
                <span className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">
                    {t('ratingsCount', {
                        count: totalRatings + likesGiven + dislikesGiven,
                    })}
                </span>
            </div>

            {maxCount > 0 && (
                <>
                    <div className="mt-4 flex min-h-24 flex-1 items-end gap-1 sm:gap-1.5">
                        {RATING_STEPS.map((step) => {
                            const count = stepCounts[step] || 0;
                            const height =
                                count > 0 ? (count / maxCount) * 85 : 0;

                            return (
                                <div
                                    key={step}
                                    className="flex h-full flex-1 flex-col justify-end gap-1"
                                    title={`${formatStep(step)} ★ — ${count}`}
                                >
                                    <span className="text-muted-foreground text-center text-[10px] leading-none tabular-nums sm:text-[12px]">
                                        {count > 0 ? count : ''}
                                    </span>
                                    {count > 0 ? (
                                        <div
                                            className="w-full rounded-sm bg-yellow-400 transition-all duration-500"
                                            style={{
                                                height: `max(${height}%, 4px)`,
                                            }}
                                        />
                                    ) : (
                                        <div className="bg-border h-0.5 w-full rounded-sm" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-1.5 flex gap-1 sm:gap-1.5">
                        {RATING_STEPS.map((step) => (
                            <span
                                key={step}
                                className="text-muted-foreground flex-1 text-center font-mono text-[10px] sm:text-[12px]"
                            >
                                {step % 1 === 0 ? step : ''}
                            </span>
                        ))}
                    </div>
                </>
            )}

            {hasThumbs && (
                <div
                    className={`flex flex-wrap items-center gap-2 ${
                        maxCount > 0 ? 'mt-2 pt-3' : 'mt-4'
                    }`}
                >
                    <span className="bg-background flex items-center gap-1.5 rounded-full px-2 py-0.5">
                        <ThumbsUpIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
                        <span className="flex items-baseline gap-1 text-green-600">
                            <span className="text-sm font-bold tabular-nums">
                                {likesGiven}
                            </span>
                            <span className="text-xs font-medium">
                                {t('likesGiven')}
                            </span>
                        </span>
                    </span>
                    <span className="bg-background flex items-center gap-1.5 rounded-full px-2 py-0.5">
                        <ThumbsDownIcon className="h-3.5 w-3.5 shrink-0 text-red-600" />
                        <span className="flex items-baseline gap-1 text-red-600">
                            <span className="text-sm font-bold tabular-nums">
                                {dislikesGiven}
                            </span>
                            <span className="text-xs font-medium">
                                {t('dislikesGiven')}
                            </span>
                        </span>
                    </span>
                </div>
            )}
        </div>
    );
}

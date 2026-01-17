'use client';

import { useTranslations } from 'next-intl';

interface RatingDistributionProps {
    distribution: Record<number, number>;
}

export function RatingDistribution({ distribution }: RatingDistributionProps) {
    const t = useTranslations('ProfilePage');
    const maxCount = Math.max(...Object.values(distribution), 0);
    const ratings = [5, 4, 3, 2, 1];

    if (maxCount === 0) {
        return null;
    }

    return (
        <div className="bg-card w-full rounded-lg border p-4 shadow-sm">
            <h3 className="mb-4 font-semibold">{t('ratingDistribution')}</h3>
            <div className="space-y-2">
                {ratings.map((rating) => {
                    const count = distribution[rating] || 0;
                    const percentage =
                        maxCount > 0 ? (count / maxCount) * 100 : 0;

                    return (
                        <div
                            key={rating}
                            className="flex items-center gap-2"
                        >
                            <div className="flex w-8 shrink-0 items-center justify-end font-mono text-sm">
                                {rating}
                                <span className="text-muted-foreground ml-1 text-xs">
                                    ★
                                </span>
                            </div>
                            <div className="bg-background relative h-4 flex-1 overflow-hidden rounded-full">
                                <div
                                    className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className="text-muted-foreground w-8 shrink-0 text-right text-xs">
                                {count}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

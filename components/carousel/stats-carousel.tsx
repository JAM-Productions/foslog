'use client';

import React, { useState } from 'react';
import { TrendingUp, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function StatsCarousel({
    globalStats,
    total,
    selectedMediaType,
    getTypeDisplayName,
}: {
    globalStats: {
        topRated: number;
        recentlyAdded: number;
    };
    total: number;
    selectedMediaType: string;
    getTypeDisplayName: (type: string) => string;
}) {
    const tStats = useTranslations('Stats');
    const [activeIndex, setActiveIndex] = useState(0);

    const nextSlide = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % statsCards.length);
    };

    const prevSlide = () => {
        setActiveIndex((prevIndex) =>
            prevIndex === 0 ? statsCards.length - 1 : prevIndex - 1
        );
    };

    const statsCards = [
        {
            icon: Star,
            title: tStats('topRated'),
            value: globalStats.topRated.toFixed(1),
            description: tStats('highestRatedInCollection'),
        },
        {
            icon: TrendingUp,
            title: tStats('totalItems'),
            value: total,
            description:
                selectedMediaType === 'all'
                    ? tStats('allMediaTypes')
                    : getTypeDisplayName(selectedMediaType),
        },
        {
            icon: Clock,
            title: tStats('recentlyAdded'),
            value: globalStats.recentlyAdded,
            description: tStats('fromLastMonth'),
        },
    ];

    const Icon = statsCards[activeIndex].icon;

    return (
        <div className="relative">
            <div className="bg-card rounded-lg border p-4">
                <div className="text-primary mb-2 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        {statsCards[activeIndex].title}
                    </span>
                </div>
                <p className="text-2xl font-bold">
                    {statsCards[activeIndex].value}
                </p>
                <p className="text-muted-foreground text-xs">
                    {statsCards[activeIndex].description}
                </p>
            </div>
            <button
                onClick={prevSlide}
                aria-label="previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/50 p-1 text-foreground hover:bg-background/75"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button
                onClick={nextSlide}
                aria-label="next"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/50 p-1 text-foreground hover:bg-background/75"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import {
    TrendingUp,
    Clock,
    Star,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '../button/button';

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
            value: total.toString(),
            description:
                selectedMediaType === 'all'
                    ? tStats('allMediaTypes')
                    : getTypeDisplayName(selectedMediaType),
        },
        {
            icon: Clock,
            title: tStats('recentlyAdded'),
            value: globalStats.recentlyAdded.toString(),
            description: tStats('fromLastMonth'),
        },
    ];

    const nextSlide = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % statsCards.length);
    };

    const prevSlide = () => {
        setActiveIndex((prevIndex) =>
            prevIndex === 0 ? statsCards.length - 1 : prevIndex - 1
        );
    };

    const Icon = statsCards[activeIndex].icon;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <Button
                    onClick={prevSlide}
                    aria-label="previous"
                    size="sm"
                    variant="ghost"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div
                    className="bg-card w-full rounded-lg border p-4"
                    aria-live="polite"
                    aria-atomic="true"
                    role="region"
                    aria-label="Statistics carousel"
                >
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

                <Button
                    onClick={nextSlide}
                    aria-label="next"
                    size="sm"
                    variant="ghost"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>

            {/* Slide indicators */}
            <div
                className="flex justify-center gap-2"
                role="tablist"
                aria-label="Slide navigation"
            >
                {statsCards.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`h-2 w-2 cursor-pointer rounded-full transition-all ${
                            index === activeIndex
                                ? 'bg-primary'
                                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === activeIndex ? 'true' : 'false'}
                        role="tab"
                    />
                ))}
            </div>
        </div>
    );
}
